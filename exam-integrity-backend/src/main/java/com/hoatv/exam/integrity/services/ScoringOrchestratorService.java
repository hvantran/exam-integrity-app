package com.hoatv.exam.integrity.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.exam.integrity.domain.*;
import com.hoatv.exam.integrity.dtos.ReviewDashboardDTO;
import com.hoatv.exam.integrity.dtos.ScoreDTO;
import com.hoatv.exam.integrity.events.ExamSubmittedEvent;
import com.hoatv.exam.integrity.events.ScoringRequestEvent;
import com.hoatv.exam.integrity.events.ScoringResultEvent;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import com.hoatv.exam.integrity.repositories.ScoreRepository;
import com.hoatv.exam.integrity.repositories.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Orchestrates scoring after exam submission.
 * MCQ: scored immediately (synchronously).
 * Essay: emits to Python scoring-worker via Kafka topic 'scoring.request'.
 * On 'scoring.result': persists scores, computes finalScore10.
 */
@Service
public class ScoringOrchestratorService {

    private static final Logger logger = LoggerFactory.getLogger(ScoringOrchestratorService.class);

    private static final String SCORING_REQUEST_TOPIC = "scoring.request";
    private static final String EXAM_SUBMITTED_TOPIC  = "exam.submitted";
    private static final String SCORING_RESULT_TOPIC  = "scoring.result";

    private final ScoreRepository scoreRepository;
    private final SessionRepository sessionRepository;
    private final ExamRepository examRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public ScoringOrchestratorService(ScoreRepository scoreRepository,
                                      SessionRepository sessionRepository,
                                      ExamRepository examRepository,
                                      KafkaTemplate<String, Object> kafkaTemplate,
                                      ObjectMapper objectMapper) {
        this.scoreRepository   = scoreRepository;
        this.sessionRepository = sessionRepository;
        this.examRepository    = examRepository;
        this.kafkaTemplate     = kafkaTemplate;
        this.objectMapper      = objectMapper;
    }

    // BE-17: Handle exam.submitted — score MCQs, emit scoring.request for essays
    @KafkaListener(topics = EXAM_SUBMITTED_TOPIC, groupId = "scoring-orchestrator")
    public void handleExamSubmitted(ExamSubmittedEvent event) {
        logger.info("Scoring session {} for exam {}", event.sessionId(), event.examId());

        Exam exam = examRepository.findById(event.examId()).orElse(null);
        if (exam == null) {
            logger.warn("Exam {} not found; skipping scoring for session {}", event.examId(), event.sessionId());
            return;
        }

        for (Question q : exam.getQuestions()) {
            String studentAnswer = event.answers().getOrDefault(q.getId(), "");

            if (q.getType() == Question.QuestionType.MCQ) {
                Score score = scoreMcq(event.sessionId(), q, studentAnswer);
                scoreRepository.save(score);
            } else {
                // Essay: emit to Python scoring-worker
                String rubricJson = serializeRubric(q.getRubric());
                ScoringRequestEvent req = new ScoringRequestEvent(
                    event.sessionId(), q.getId(), studentAnswer, rubricJson, q.getPoints()
                );
                // Persist placeholder with PENDING_ESSAY status
                Score placeholder = new Score();
                placeholder.setId(UUID.randomUUID().toString());
                placeholder.setSessionId(event.sessionId());
                placeholder.setQuestionId(q.getId());
                placeholder.setStudentAnswer(studentAnswer);
                placeholder.setMaxPoints(q.getPoints());
                placeholder.setEarnedPoints(0);
                placeholder.setStatus(Score.ScoreStatus.PENDING_ESSAY);
                scoreRepository.save(placeholder);

                kafkaTemplate.send(SCORING_REQUEST_TOPIC, event.sessionId(), req);
                logger.debug("Essay scoring request emitted for session={} q={}", event.sessionId(), q.getId());
            }
        }
    }

    // BE-18: MCQ scoring
    private Score scoreMcq(String sessionId, Question question, String studentAnswer) {
        Score score = new Score();
        score.setId(UUID.randomUUID().toString());
        score.setSessionId(sessionId);
        score.setQuestionId(question.getId());
        score.setStudentAnswer(studentAnswer);
        score.setMaxPoints(question.getPoints());

        // Detect multiple-answer attempt (comma-separated)
        if (studentAnswer != null && studentAnswer.contains(",")) {
            score.setStatus(Score.ScoreStatus.MULTIPLE_ANSWERS_FLAG);
            score.setEarnedPoints(0);
            return score;
        }

        // Truncated questions get self-grade flag
        if (question.isTruncated()) {
            score.setStatus(Score.ScoreStatus.INCOMPLETE_QUESTION);
            score.setEarnedPoints(0);
            return score;
        }

        // Blank answer
        if (studentAnswer == null || studentAnswer.isBlank()) {
            score.setStatus(Score.ScoreStatus.INCORRECT);
            score.setEarnedPoints(0);
            return score;
        }

        boolean correct = question.getCorrectAnswer() != null
            && studentAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim());

        score.setStatus(correct ? Score.ScoreStatus.CORRECT : Score.ScoreStatus.INCORRECT);
        score.setEarnedPoints(correct ? question.getPoints() : 0);
        score.setExplanation(question.getCorrectAnswer());
        return score;
    }

    // BE-19: Listen scoring.result from Python worker
    @KafkaListener(topics = SCORING_RESULT_TOPIC, groupId = "scoring-orchestrator")
    public void handleScoringResult(ScoringResultEvent event) {
        logger.info("Essay score received session={} q={} pts={}", event.sessionId(), event.questionId(), event.earnedPoints());

        // Update existing PENDING_ESSAY score placeholder
        List<Score> existing = scoreRepository.findBySessionId(event.sessionId());
        existing.stream()
            .filter(s -> event.questionId().equals(s.getQuestionId()))
            .findFirst()
            .ifPresent(s -> {
                s.setEarnedPoints(event.earnedPoints());
                s.setStatus(Score.ScoreStatus.valueOf(event.scoreStatus()));
                s.setScoreBreakdownFromJson(event.scoreBreakdownJson());
                scoreRepository.save(s);
            });

        // After persisting, check if all scores are resolved and compute finalScore10
        recomputeFinalScoreIfComplete(event.sessionId());
    }

    // BE-20: getReviewDashboard
    public Optional<ReviewDashboardDTO> getReviewDashboard(String sessionId) {
        List<Score> scores = scoreRepository.findBySessionId(sessionId);
        if (scores.isEmpty()) {
            // Check session exists but no scores yet
            return sessionRepository.findById(sessionId)
                .map(s -> null); // return empty Optional if session exists but no scores
        }

        double totalEarned = scores.stream().mapToDouble(Score::getEarnedPoints).sum();
        double totalMax    = scores.stream().mapToDouble(Score::getMaxPoints).sum();
        double finalScore10 = totalMax > 0 ? (totalEarned / totalMax) * 10.0 : 0.0;

        List<Integer> missedNumbers = new ArrayList<>();
        List<ScoreDTO> scoreDTOs = scores.stream()
            .map(s -> new ScoreDTO(
                s.getQuestionId(), 0, s.getEarnedPoints(), s.getMaxPoints(),
                s.getStatus() != null ? s.getStatus().name() : "INCORRECT",
                s.getStudentAnswer(), s.getExplanation(), s.getExplanation(),
                s.getScoreBreakdownJson()
            ))
            .collect(Collectors.toList());

        return Optional.of(new ReviewDashboardDTO(sessionId, totalEarned, totalMax,
            Math.round(finalScore10 * 10.0) / 10.0, missedNumbers, scoreDTOs));
    }

    private void recomputeFinalScoreIfComplete(String sessionId) {
        List<Score> scores = scoreRepository.findBySessionId(sessionId);
        boolean allDone = scores.stream()
            .noneMatch(s -> s.getStatus() == Score.ScoreStatus.PENDING_ESSAY);
        if (allDone) {
            logger.info("All scoring complete for session {}", sessionId);
        }
    }

    private String serializeRubric(Rubric rubric) {
        if (rubric == null) return "{}";
        try {
            Map<String, Object> map = new HashMap<>();
            map.put("keywords", rubric.getKeywords());
            map.put("steps", rubric.getExpectedSteps());
            map.put("correct_final_answer", rubric.getFinalAnswer());
            map.put("reference_answer", rubric.getModelAnswer());
            map.put("format_requirements", rubric.getFormatChecks());
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
