package com.hoatv.exam.integrity.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MongoDB document tracking a student's exam session.
 *
 * Timer truth lives in Redis (key: timer:{sessionId}).
 * Answers are embedded here as a map keyed by questionId.
 *
 * Collection: exam_sessions
 */
@Document(collection = "exam_sessions")
@CompoundIndex(name = "student_exam_status_idx", def = "{'studentId': 1, 'examId': 1, 'status': 1}")
public class ExamSession {

    @Id
    private String id;

    @Indexed
    private String examId;

    @Indexed
    private String studentId;

    private SessionStatus status;

    private Instant startedAt;

    private Instant submittedAt;

    /**
     * Proctoring risk score 0–100.
     * Computed from frequency and severity of captured proctor events.
     * Sessions with riskScore >= 70 are flagged for teacher review.
     */
    private int riskScore;

    /**
     * Student answers keyed by questionId.
     * Saved incrementally as student navigates questions.
     * key:   questionId (UUID)
     * value: AnswerRecord (answer text + flagged status)
     */
    private Map<String, AnswerRecord> answers = new HashMap<>();

    public enum SessionStatus {
        /** Timer running, student actively answering. */
        ACTIVE,
        /** Student clicked Submit and confirmed. */
        SUBMITTED,
        /** Timer hit 00:00; backend issued FORCE_SUBMIT. */
        FORCE_SUBMITTED,
        /** riskScore >= 70; flagged for teacher review. */
        FLAGGED
    }

    /**
     * Embedded answer record for one question.
     */
    public static class AnswerRecord {
        /** Student's free-text or MCQ answer. */
        private String answer;
        /** Structured answers for sub-questions when the prompt is split in the UI. */
        private List<AnswerPartRecord> answerParts = new ArrayList<>();
        /** True when student used "Flag for Review" button. */
        private boolean flaggedForReview;
        /** Wall-clock time when this answer was last saved. */
        private Instant savedAt;

        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }

        public List<AnswerPartRecord> getAnswerParts() { return answerParts; }
        public void setAnswerParts(List<AnswerPartRecord> answerParts) { this.answerParts = answerParts; }

        public boolean isFlaggedForReview() { return flaggedForReview; }
        public void setFlaggedForReview(boolean flaggedForReview) { this.flaggedForReview = flaggedForReview; }

        public Instant getSavedAt() { return savedAt; }
        public void setSavedAt(Instant savedAt) { this.savedAt = savedAt; }
    }

    public static class AnswerPartRecord {
        private String key;
        private String answer;

        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }

        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
    }

    // ----- Getters & Setters -----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getExamId() { return examId; }
    public void setExamId(String examId) { this.examId = examId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public Map<String, AnswerRecord> getAnswers() { return answers; }
    public void setAnswers(Map<String, AnswerRecord> answers) { this.answers = answers; }
}
