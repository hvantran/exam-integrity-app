package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Exam;
import com.hoatv.exam.integrity.domain.ExamSession;
import com.hoatv.exam.integrity.domain.Question;
import com.hoatv.exam.integrity.dtos.AnswerPartDTO;
import com.hoatv.exam.integrity.dtos.QuestionSummaryDTO;
import com.hoatv.exam.integrity.dtos.SessionDTO;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import com.hoatv.exam.integrity.repositories.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.hoatv.fwk.common.exceptions.DuplicateResourceException;
import com.hoatv.fwk.common.exceptions.EntityNotFoundException;
import com.hoatv.fwk.common.exceptions.InvalidArgumentException;

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
    private static final String ACTIVE_SESSIONS_KEY = "active_sessions";
    private static final String TIMER_KEY_PREFIX = "timer:";
    private static final String LOG_INJECTION_REGEX = "[\r\n]";

    private final SessionRepository sessionRepository;
    private final ExamRepository examRepository;
    private final StringRedisTemplate redisTemplate;
    private final SessionReviewService sessionReviewService;

    public SessionService(SessionRepository sessionRepository,
                          ExamRepository examRepository,
                          StringRedisTemplate redisTemplate,
                          SessionReviewService sessionReviewService) {
        this.sessionRepository = sessionRepository;
        this.examRepository    = examRepository;
        this.redisTemplate     = redisTemplate;
        this.sessionReviewService = sessionReviewService;
    }

    // BE-11: createSession
    public SessionDTO createSession(String examId, String studentId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new EntityNotFoundException("Exam not found: " + examId));

        if (com.hoatv.exam.integrity.security.UserContext.isStudent()) {
            Integer studentGrade = com.hoatv.exam.integrity.security.UserContext.getStudentGrade();
            if (studentGrade != null) {
                Integer examGrade = exam.getGrade();
                if (examGrade == null) {
                    examGrade = ExamGradeExtractor.extractGradeFromTags(exam.getTags());
                }
                if (examGrade != null && !studentGrade.equals(examGrade)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        String.format("Student grade %d cannot access exam for grade %d", studentGrade, examGrade));
                }
            }
        }

        sessionRepository.findByStudentIdAndExamIdAndStatus(studentId, examId, ExamSession.SessionStatus.ACTIVE)
            .ifPresent(s -> { throw new DuplicateResourceException(
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
            TIMER_KEY_PREFIX + session.getId(),
            String.valueOf(duration),
            duration, TimeUnit.SECONDS
        );
        redisTemplate.opsForSet().add(ACTIVE_SESSIONS_KEY, session.getId());

        String safeSessionId = session.getId() != null ? session.getId().replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safeStudentId = studentId != null ? studentId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safeExamId = examId != null ? examId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        logger.info("Session {} created for student {} on exam {}", safeSessionId, safeStudentId, safeExamId);
        return toDTO(session, duration);
    }

    // BE-12: getSession
    public Optional<SessionDTO> findSession(String sessionId) {
        return sessionRepository.findById(sessionId)
            .map(s -> toDTO(s, (int) getRemainingSeconds(sessionId)));
    }

    // BE-13: getTimer (REST fallback)
    public long getRemainingSeconds(String sessionId) {
        Long ttl = redisTemplate.getExpire(TIMER_KEY_PREFIX + sessionId, TimeUnit.SECONDS);
        return ttl != null && ttl > 0 ? ttl : 0;
    }

    // BE-14: getQuestion
    public QuestionSummaryDTO getQuestion(String sessionId, int questionNumber) {
        ExamSession session = findSessionOrThrow(sessionId);
        if (session.getStatus() != ExamSession.SessionStatus.ACTIVE) {
            throw new InvalidArgumentException(
                "Session is " + session.getStatus() + ", not ACTIVE");
        }
        Exam exam = examRepository.findById(session.getExamId())
            .orElseThrow(() -> new EntityNotFoundException("Exam not found"));

        List<Question> questionList = exam.getQuestions();
        return questionList.stream()
            .filter(q -> q.getQuestionNumber() == questionNumber)
            .findFirst()
            // Fallback: treat questionNumber as 1-based list index if no match by field
            .or(() -> (questionNumber >= 1 && questionNumber <= questionList.size())
                ? Optional.of(questionList.get(questionNumber - 1))
                : Optional.empty())
            .map(this::toQuestionSummary)
            .orElseThrow(() -> new EntityNotFoundException(
                "Question " + questionNumber + " not found"));
    }

    // BE-15: saveAnswer
    public void saveAnswer(String sessionId, String questionId, String answer, boolean flaggedForReview, List<AnswerPartDTO> answerParts) {
        ExamSession session = findSessionOrThrow(sessionId);
        if (session.getStatus() != ExamSession.SessionStatus.ACTIVE) {
            throw new InvalidArgumentException("Session is not ACTIVE");
        }
        ExamSession.AnswerRecord answerRecord = new ExamSession.AnswerRecord();
        answerRecord.setAnswer(normalizeAnswer(answer, answerParts));
        answerRecord.setAnswerParts(toAnswerPartRecords(answerParts));
        answerRecord.setFlaggedForReview(flaggedForReview);
        answerRecord.setSavedAt(Instant.now());
        session.getAnswers().put(questionId, answerRecord);
        sessionRepository.save(session);
    }

    // BE-16: submitExam
    public void submitExam(String sessionId, boolean forceSubmit) {
        ExamSession session = findSessionOrThrow(sessionId);
        if (session.getStatus() == ExamSession.SessionStatus.SUBMITTED
         || session.getStatus() == ExamSession.SessionStatus.FORCE_SUBMITTED) {
            // Clean up Redis even when already submitted to evict stale active_sessions entries
            redisTemplate.opsForSet().remove(ACTIVE_SESSIONS_KEY, sessionId);
            throw new DuplicateResourceException("Already submitted");
        }
        session.setStatus(forceSubmit ? ExamSession.SessionStatus.FORCE_SUBMITTED
                                      : ExamSession.SessionStatus.SUBMITTED);
        session.setSubmittedAt(Instant.now());
        sessionRepository.save(session);

        redisTemplate.delete(TIMER_KEY_PREFIX + sessionId);
        redisTemplate.opsForSet().remove(ACTIVE_SESSIONS_KEY, sessionId);

        sessionReviewService.initializeScores(session);
        String safeSessionId = sessionId != null ? sessionId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        logger.info("Session {} submitted (force={})", safeSessionId, forceSubmit);
    }

    public Set<String> getActiveSessionIds() {
        Set<String> members = redisTemplate.opsForSet().members(ACTIVE_SESSIONS_KEY);
        return members != null ? members : Set.of();
    }

    public ExamSession findSessionOrThrow(String sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new EntityNotFoundException("Session not found: " + sessionId));
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
            question.getBankItemId(),
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
                ExamSession.AnswerPartRecord partRecord = new ExamSession.AnswerPartRecord();
                partRecord.setKey(part.key());
                partRecord.setAnswer(part.answer());
                return partRecord;
            })
            .toList();
    }
}
