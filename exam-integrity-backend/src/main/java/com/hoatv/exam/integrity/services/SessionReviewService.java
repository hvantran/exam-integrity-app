package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Exam;
import com.hoatv.exam.integrity.domain.ExamSession;
import com.hoatv.exam.integrity.domain.Question;
import com.hoatv.exam.integrity.domain.Rubric;
import com.hoatv.exam.integrity.domain.Score;
import com.hoatv.exam.integrity.dtos.ReviewDashboardDTO;
import com.hoatv.exam.integrity.dtos.ScoreDTO;
import com.hoatv.exam.integrity.dtos.SessionResultSummaryDTO;
import com.hoatv.exam.integrity.dtos.TeacherScoreUpdateDTO;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import com.hoatv.exam.integrity.repositories.ScoreRepository;
import com.hoatv.exam.integrity.repositories.SessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SessionReviewService {

    private static final EnumSet<Score.ScoreStatus> TEACHER_PENDING_STATUSES = EnumSet.of(
        Score.ScoreStatus.SELF_GRADE_REQUIRED,
        Score.ScoreStatus.PENDING_ESSAY
    );

    private final ScoreRepository scoreRepository;
    private final SessionRepository sessionRepository;
    private final ExamRepository examRepository;

    public SessionReviewService(ScoreRepository scoreRepository,
                                SessionRepository sessionRepository,
                                ExamRepository examRepository) {
        this.scoreRepository = scoreRepository;
        this.sessionRepository = sessionRepository;
        this.examRepository = examRepository;
    }

    public void initializeScores(ExamSession session) {
        if (!scoreRepository.findBySessionId(session.getId()).isEmpty()) {
            return;
        }

        Exam exam = examRepository.findById(session.getExamId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found: " + session.getExamId()));

        List<Score> scores = exam.getQuestions().stream()
            .map(question -> createInitialScore(session, question))
            .toList();

        scoreRepository.saveAll(scores);
    }

    public Optional<ReviewDashboardDTO> getReviewDashboard(String sessionId) {
        ExamSession session = sessionRepository.findById(sessionId).orElse(null);
        if (session == null) {
            return Optional.empty();
        }

        List<Score> scores = scoreRepository.findBySessionId(sessionId).stream()
            .sorted(Comparator.comparingInt(Score::getQuestionNumber))
            .toList();
        if (scores.isEmpty()) {
            return Optional.empty();
        }

        Map<String, Question> questionMap = loadQuestionMap(session.getExamId());
        double totalEarned = scores.stream().mapToDouble(Score::getEarnedPoints).sum();
        double totalMax = scores.stream().mapToDouble(Score::getMaxPoints).sum();
        double finalScore10 = totalMax > 0 ? roundToOneDecimal((totalEarned / totalMax) * 10.0) : 0.0;

        List<Integer> missedNumbers = scores.stream()
            .filter(score -> score.getStatus() == Score.ScoreStatus.INCORRECT
                || score.getStatus() == Score.ScoreStatus.INCOMPLETE_QUESTION
                || score.getStatus() == Score.ScoreStatus.MULTIPLE_ANSWERS_FLAG)
            .map(Score::getQuestionNumber)
            .toList();

        List<ScoreDTO> scoreDTOs = scores.stream()
            .map(score -> toScoreDTO(score, questionMap.get(score.getQuestionId())))
            .toList();

        return Optional.of(new ReviewDashboardDTO(
            sessionId,
            totalEarned,
            totalMax,
            finalScore10,
            missedNumbers,
            scoreDTOs
        ));
    }

    public List<SessionResultSummaryDTO> getStudentResults(String studentId) {
        return sessionRepository.findByStudentId(studentId).stream()
            .filter(session -> session.getStatus() != ExamSession.SessionStatus.ACTIVE)
            .sorted(Comparator.comparing(ExamSession::getSubmittedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::toSummary)
            .toList();
    }

    public List<SessionResultSummaryDTO> getTeacherScoringQueue() {
        Map<String, Long> pendingEssayCounts = scoreRepository.findByStatusIn(TEACHER_PENDING_STATUSES).stream()
            .collect(Collectors.groupingBy(Score::getSessionId, Collectors.counting()));

        return pendingEssayCounts.keySet().stream()
            .map(sessionRepository::findById)
            .flatMap(Optional::stream)
            .sorted(Comparator.comparing(ExamSession::getSubmittedAt, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(this::toSummary)
            .toList();
    }

    public ReviewDashboardDTO gradeEssay(String sessionId, String questionId, TeacherScoreUpdateDTO updateDTO) {
        Score score = scoreRepository.findBySessionIdAndQuestionId(sessionId, questionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Score not found for question: " + questionId));

        if (Question.QuestionType.MCQ.name().equals(score.getQuestionType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MCQ questions are auto-graded and cannot be teacher-scored");
        }

        double earnedPoints = updateDTO.earnedPoints();
        if (earnedPoints > score.getMaxPoints()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Essay score cannot exceed configured question points"
            );
        }

        score.setEarnedPoints(earnedPoints);
        score.setStatus(resolveManualStatus(earnedPoints, score.getMaxPoints()));
        if (updateDTO.explanation() != null) {
            score.setExplanation(updateDTO.explanation().trim());
        }
        scoreRepository.save(score);

        return getReviewDashboard(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review dashboard not found for session: " + sessionId));
    }

    private Score createInitialScore(ExamSession session, Question question) {
        String studentAnswer = Optional.ofNullable(session.getAnswers().get(question.getId()))
            .map(ExamSession.AnswerRecord::getAnswer)
            .orElse("");

        Score score = baseScore(session.getId(), question, studentAnswer);
        if (question.getType() == Question.QuestionType.MCQ) {
            return scoreMcq(score, question, studentAnswer);
        }

        score.setEarnedPoints(0);
        score.setStatus(Score.ScoreStatus.SELF_GRADE_REQUIRED);
        return score;
    }

    private Score baseScore(String sessionId, Question question, String studentAnswer) {
        Score score = new Score();
        score.setId(UUID.randomUUID().toString());
        score.setSessionId(sessionId);
        score.setQuestionId(question.getId());
        score.setQuestionNumber(question.getQuestionNumber());
        score.setQuestionType(question.getType() != null ? question.getType().name() : Question.QuestionType.MCQ.name());
        score.setStudentAnswer(studentAnswer);
        score.setMaxPoints(question.getPoints());
        score.setCorrectAnswer(resolveReferenceAnswer(question));
        return score;
    }

    private Score scoreMcq(Score score, Question question, String studentAnswer) {
        if (studentAnswer != null && studentAnswer.contains(",")) {
            score.setStatus(Score.ScoreStatus.MULTIPLE_ANSWERS_FLAG);
            score.setEarnedPoints(0);
            return score;
        }

        if (question.isTruncated()) {
            score.setStatus(Score.ScoreStatus.INCOMPLETE_QUESTION);
            score.setEarnedPoints(0);
            return score;
        }

        if (studentAnswer == null || studentAnswer.isBlank()) {
            score.setStatus(Score.ScoreStatus.INCORRECT);
            score.setEarnedPoints(0);
            return score;
        }

        boolean correct = question.getCorrectAnswer() != null
            && studentAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim());

        score.setStatus(correct ? Score.ScoreStatus.CORRECT : Score.ScoreStatus.INCORRECT);
        score.setEarnedPoints(correct ? question.getPoints() : 0);
        score.setExplanation(correct ? "" : "Review the reference answer for the expected choice.");
        return score;
    }

    private Map<String, Question> loadQuestionMap(String examId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found: " + examId));

        Map<String, Question> questionMap = new HashMap<>();
        for (Question question : exam.getQuestions()) {
            questionMap.put(question.getId(), question);
        }
        return questionMap;
    }

    private ScoreDTO toScoreDTO(Score score, Question question) {
        String questionText = question != null ? question.getContent() : null;
        return new ScoreDTO(
            score.getQuestionId(),
            score.getQuestionNumber(),
            score.getEarnedPoints(),
            score.getMaxPoints(),
            score.getStatus() != null ? score.getStatus().name() : Score.ScoreStatus.INCORRECT.name(),
            score.getQuestionType(),
            questionText,
            score.getStudentAnswer(),
            score.getCorrectAnswer(),
            score.getExplanation(),
            score.getScoreBreakdownJson()
        );
    }

    private SessionResultSummaryDTO toSummary(ExamSession session) {
        Exam exam = examRepository.findById(session.getExamId()).orElse(null);
        List<Score> scores = scoreRepository.findBySessionId(session.getId());
        double totalEarned = scores.stream().mapToDouble(Score::getEarnedPoints).sum();
        double totalMax = scores.stream().mapToDouble(Score::getMaxPoints).sum();
        int pendingEssayCount = (int) scores.stream()
            .filter(score -> score.getStatus() == Score.ScoreStatus.SELF_GRADE_REQUIRED
                || score.getStatus() == Score.ScoreStatus.PENDING_ESSAY)
            .count();
        double finalScore10 = totalMax > 0 ? roundToOneDecimal((totalEarned / totalMax) * 10.0) : 0.0;

        return new SessionResultSummaryDTO(
            session.getId(),
            session.getExamId(),
            exam != null ? exam.getTitle() : session.getExamId(),
            session.getStudentId(),
            session.getStatus() != null ? session.getStatus().name() : ExamSession.SessionStatus.SUBMITTED.name(),
            session.getSubmittedAt(),
            totalEarned,
            totalMax,
            finalScore10,
            pendingEssayCount
        );
    }

    private String resolveReferenceAnswer(Question question) {
        if (question.getCorrectAnswer() != null && !question.getCorrectAnswer().isBlank()) {
            return question.getCorrectAnswer();
        }

        Rubric rubric = question.getRubric();
        if (rubric == null) {
            return null;
        }
        if (rubric.getModelAnswer() != null && !rubric.getModelAnswer().isBlank()) {
            return rubric.getModelAnswer();
        }
        if (rubric.getFinalAnswer() != null && !rubric.getFinalAnswer().isBlank()) {
            return rubric.getFinalAnswer();
        }
        if (rubric.getExpectedSteps() != null && !rubric.getExpectedSteps().isEmpty()) {
            return String.join("; ", rubric.getExpectedSteps());
        }
        return null;
    }

    private Score.ScoreStatus resolveManualStatus(double earnedPoints, double maxPoints) {
        if (earnedPoints <= 0) {
            return Score.ScoreStatus.INCORRECT;
        }
        if (earnedPoints >= maxPoints) {
            return Score.ScoreStatus.CORRECT;
        }
        return Score.ScoreStatus.PARTIAL;
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}