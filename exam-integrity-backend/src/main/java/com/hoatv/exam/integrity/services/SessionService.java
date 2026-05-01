package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Exam;
import com.hoatv.exam.integrity.domain.ExamSession;
import com.hoatv.exam.integrity.domain.Question;
import com.hoatv.exam.integrity.dtos.AnswerPartDTO;
import com.hoatv.exam.integrity.dtos.QuestionSummaryDTO;
import com.hoatv.exam.integrity.dtos.SessionDTO;
import com.hoatv.exam.integrity.events.ExamSubmittedEvent;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import com.hoatv.exam.integrity.repositories.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Creates and manages exam sessions.
 * Timer truth lives in Redis (key: timer:{sessionId}).
 * MongoDB stores the canonical session record.
 */
@Service
public class SessionService {

    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);
    private static final String EXAM_SUBMITTED_TOPIC = "exam.submitted";

    private final SessionRepository sessionRepository;
    private final ExamRepository examRepository;
    private final StringRedisTemplate redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public SessionService(SessionRepository sessionRepository,
                          ExamRepository examRepository,
                          StringRedisTemplate redisTemplate,
                          KafkaTemplate<String, Object> kafkaTemplate) {
        this.sessionRepository = sessionRepository;
        this.examRepository    = examRepository;
        this.redisTemplate     = redisTemplate;
        this.kafkaTemplate     = kafkaTemplate;
    }

    // BE-11: createSession
    public SessionDTO createSession(String examId, String studentId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found: " + examId));

        sessionRepository.findByStudentIdAndExamIdAndStatus(studentId, examId, ExamSession.SessionStatus.ACTIVE)
            .ifPresent(s -> { throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Student already has an active session for this exam"); });

        ExamSession session = new ExamSession();
        session.setId(UUID.randomUUID().toString());
        session.setExamId(examId);
        session.setStudentId(studentId);
        session.setStatus(ExamSession.SessionStatus.ACTIVE);
        session.setStartedAt(Instant.now());
        sessionRepository.save(session);

        int duration = exam.getDurationSeconds();
        redisTemplate.opsForValue().set(
            "timer:" + session.getId(),
            String.valueOf(duration),
            duration, TimeUnit.SECONDS
        );
        redisTemplate.opsForSet().add("active_sessions", session.getId());

        logger.info("Session {} created for student {} on exam {}", session.getId(), studentId, examId);
        return toDTO(session, duration);
    }

    // BE-12: getSession
    public Optional<SessionDTO> findSession(String sessionId) {
        return sessionRepository.findById(sessionId)
            .map(s -> toDTO(s, (int) getRemainingSeconds(sessionId)));
    }

    // BE-13: getTimer (REST fallback)
    public long getRemainingSeconds(String sessionId) {
        Long ttl = redisTemplate.getExpire("timer:" + sessionId, TimeUnit.SECONDS);
        return ttl != null && ttl > 0 ? ttl : 0;
    }

    // BE-14: getQuestion
    public QuestionSummaryDTO getQuestion(String sessionId, int questionNumber) {
        ExamSession session = findSessionOrThrow(sessionId);
        if (session.getStatus() != ExamSession.SessionStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Session is " + session.getStatus() + ", not ACTIVE");
        }
        Exam exam = examRepository.findById(session.getExamId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        List<Question> questionList = exam.getQuestions();
        return questionList.stream()
            .filter(q -> q.getQuestionNumber() == questionNumber)
            .findFirst()
            // Fallback: treat questionNumber as 1-based list index if no match by field
            .or(() -> (questionNumber >= 1 && questionNumber <= questionList.size())
                ? Optional.of(questionList.get(questionNumber - 1))
                : Optional.empty())
            .map(this::toQuestionSummary)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Question " + questionNumber + " not found"));
    }

    // BE-15: saveAnswer
    public void saveAnswer(String sessionId, String questionId, String answer, boolean flaggedForReview, List<AnswerPartDTO> answerParts) {
        ExamSession session = findSessionOrThrow(sessionId);
        if (session.getStatus() != ExamSession.SessionStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Session is not ACTIVE");
        }
        ExamSession.AnswerRecord record = new ExamSession.AnswerRecord();
        record.setAnswer(normalizeAnswer(answer, answerParts));
        record.setAnswerParts(toAnswerPartRecords(answerParts));
        record.setFlaggedForReview(flaggedForReview);
        record.setSavedAt(Instant.now());
        session.getAnswers().put(questionId, record);
        sessionRepository.save(session);
    }

    // BE-16: submitExam
    public void submitExam(String sessionId, boolean forceSubmit) {
        ExamSession session = findSessionOrThrow(sessionId);
        if (session.getStatus() == ExamSession.SessionStatus.SUBMITTED
         || session.getStatus() == ExamSession.SessionStatus.FORCE_SUBMITTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already submitted");
        }
        session.setStatus(forceSubmit ? ExamSession.SessionStatus.FORCE_SUBMITTED
                                      : ExamSession.SessionStatus.SUBMITTED);
        session.setSubmittedAt(Instant.now());
        sessionRepository.save(session);

        redisTemplate.delete("timer:" + sessionId);
        redisTemplate.opsForSet().remove("active_sessions", sessionId);

        Map<String, String> answers = session.getAnswers().entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().getAnswer() != null ? e.getValue().getAnswer() : ""
            ));
        kafkaTemplate.send(EXAM_SUBMITTED_TOPIC, sessionId,
            new ExamSubmittedEvent(sessionId, session.getExamId(), session.getStudentId(),
                answers, session.getSubmittedAt(), forceSubmit));
        logger.info("Session {} submitted (force={})", sessionId, forceSubmit);
    }

    public Set<String> getActiveSessionIds() {
        Set<String> members = redisTemplate.opsForSet().members("active_sessions");
        return members != null ? members : Set.of();
    }

    public ExamSession findSessionOrThrow(String sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found: " + sessionId));
    }

    private SessionDTO toDTO(ExamSession s, long remainingSeconds) {
        return new SessionDTO(s.getId(), s.getExamId(), s.getStudentId(),
            s.getStatus() != null ? s.getStatus().name() : "ACTIVE",
            s.getStartedAt(), remainingSeconds);
    }

    private QuestionSummaryDTO toQuestionSummary(Question question) {
        QuestionStructureParser.ParsedQuestionContent parsedContent =
            question.getType() == Question.QuestionType.MCQ
                ? QuestionStructureParser.ParsedQuestionContent.empty()
                : QuestionStructureParser.parse(question.getContent());

        return new QuestionSummaryDTO(
            question.getId(),
            question.getQuestionNumber(),
            question.getContent(),
            parsedContent.stem(),
            question.getType() != null ? question.getType().name() : "MCQ",
            question.getPoints(),
            question.getOptions(),
            parsedContent.parts(),
            question.isTruncated(),
            question.getImageData()
        );
    }

    private String normalizeAnswer(String answer, List<AnswerPartDTO> answerParts) {
        if (answer != null && !answer.isBlank()) {
            return answer;
        }
        if (answerParts == null || answerParts.isEmpty()) {
            return answer;
        }
        return answerParts.stream()
            .filter(part -> part != null && part.answer() != null && !part.answer().isBlank())
            .map(part -> part.key() + ") " + part.answer().trim())
            .collect(Collectors.joining("\n\n"));
    }

    private List<ExamSession.AnswerPartRecord> toAnswerPartRecords(List<AnswerPartDTO> answerParts) {
        if (answerParts == null || answerParts.isEmpty()) {
            return List.of();
        }
        return answerParts.stream()
            .filter(Objects::nonNull)
            .map(part -> {
                ExamSession.AnswerPartRecord record = new ExamSession.AnswerPartRecord();
                record.setKey(part.key());
                record.setAnswer(part.answer());
                return record;
            })
            .collect(Collectors.toList());
    }
}
