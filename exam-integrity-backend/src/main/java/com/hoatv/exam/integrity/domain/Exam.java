package com.hoatv.exam.integrity.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB document representing a digitized exam.
 * Questions are embedded (denormalized) to enable single-document reads
 * during an active session, eliminating join overhead.
 *
 * Collection: exams
 */
@Document(collection = "exams")
public class Exam {

    @Id
    private String id;

    private String title;

    /** Total exam time in seconds (e.g. 2700 = 45 min). */
    private int durationSeconds;

    /** Sum of all question points. Used for FinalScore10 calculation. */
    private double totalPoints;

    @Indexed
    private ExamStatus status;

    /** Keycloak subject (sub) of the teacher who uploaded the PDF. */
    @Indexed
    private String uploadedBy;

    private Instant createdAt;

    /**
     * Searchable tags assigned by the teacher during the draft approval phase.
     * Examples: ["toan", "lop4", "tuan12", "phep-nhan"]
     * Used to filter exams in the exam list and assign appropriate sessions.
     */
    @Indexed
    private List<String> tags = new ArrayList<>();

    /**
     * All questions embedded in the exam document.
     * No separate collection — enables O(1) exam load.
     */
    private List<Question> questions = new ArrayList<>();

    public enum ExamStatus {
        /** Parsed, not yet published to students. */
        DRAFT,
        /** Visible and assignable to sessions. */
        ACTIVE,
        /** No longer assignable; kept for audit. */
        ARCHIVED
    }

    // ----- Getters & Setters -----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }

    public double getTotalPoints() { return totalPoints; }
    public void setTotalPoints(double totalPoints) { this.totalPoints = totalPoints; }

    public ExamStatus getStatus() { return status; }
    public void setStatus(ExamStatus status) { this.status = status; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
}
