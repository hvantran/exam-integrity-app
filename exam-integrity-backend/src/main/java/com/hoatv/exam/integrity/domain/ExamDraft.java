package com.hoatv.exam.integrity.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB document that holds the PDF parser output for teacher review
 * BEFORE it is published as a final Exam.
 *
 * Lifecycle:
 *   1. Teacher uploads PDF  → pdf-ingestion-service returns ParsedExam
 *   2. Backend creates ExamDraft  (status = PENDING_REVIEW)
 *   3. Teacher reviews each DraftQuestion in the ExamDraftReviewPage
 *   4. Teacher clicks "Publish" → ExamDraft.status = APPROVED
 *      → Backend creates Exam document (status = ACTIVE)
 *
 * Collection: exam_drafts
 */
@Document(collection = "exam_drafts")
public class ExamDraft {

    @Id
    private String id;

    /** Original uploaded filename for display in the review page. */
    private String originalFilename;

    /** PDF classification from ingestion service: "text" | "scanned" | "hybrid" */
    private String pdfType;

    /** True when at least one page required OCR (hybrid mode). */
    private boolean ocrUsed;

    /**
     * Mean OCR confidence across the document (0.0–1.0).
     * null for pure text PDFs.
     */
    private Double documentOcrConfidence;

    /** Keycloak subject (sub) of the teacher who uploaded the PDF. */
    @Indexed
    private String uploadedBy;

    private Instant uploadedAt;

    /** Job ID returned by the pdf-ingestion-service for traceability. */
    private String ingestionJobId;

    /** Which exam set was extracted if the PDF had multiple (0-based). null = single set. */
    private Integer examSetIndex;

    // ── Parsed content (editable by teacher during review) ─────────────────

    private String title;

    /** Declared total points from the PDF header. */
    private double totalPoints;

    /** Sum of individual question points as detected by the parser.
     *  Mismatch with totalPoints triggers a warning in the review UI. */
    private double detectedPointsSum;

    private int durationSeconds;

    /** True when detectedPointsSum != totalPoints. */
    private boolean hasPointMismatch;

    /** Document-level parser warnings (e.g. "Total points mismatch: declared 10, detected 9.5"). */
    private List<String> parserWarnings = new ArrayList<>();

    /**
     * Tags assigned by the teacher during review, before publishing.
     * Copied into the final Exam document on publish.
     * Examples: ["toan", "lop4", "tuan12", "phep-nhan"]
     */
    private List<String> tags = new ArrayList<>();

    /** Questions awaiting teacher review. Each carries its own integrity score. */
    private List<DraftQuestion> questions = new ArrayList<>();

    // ── Review workflow ─────────────────────────────────────────────────────

    private DraftStatus status;

    /** Keycloak subject of the teacher who reviewed (may differ from uploader). */
    private String reviewedBy;

    private Instant reviewedAt;

    /** Optional teacher note recorded when approving or rejecting the draft. */
    private String reviewNotes;

    public enum DraftStatus {
        /** Parsed, awaiting teacher review. */
        PENDING_REVIEW,
        /** Teacher has opened the review page (optimistic lock: prevents duplicate review). */
        UNDER_REVIEW,
        /** Teacher approved all questions; Exam document created. */
        APPROVED,
        /** Teacher rejected the draft (bad scan, wrong file, etc.). */
        REJECTED
    }

    // ----- Getters & Setters -----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getPdfType() { return pdfType; }
    public void setPdfType(String pdfType) { this.pdfType = pdfType; }

    public boolean isOcrUsed() { return ocrUsed; }
    public void setOcrUsed(boolean ocrUsed) { this.ocrUsed = ocrUsed; }

    public Double getDocumentOcrConfidence() { return documentOcrConfidence; }
    public void setDocumentOcrConfidence(Double documentOcrConfidence) { this.documentOcrConfidence = documentOcrConfidence; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getIngestionJobId() { return ingestionJobId; }
    public void setIngestionJobId(String ingestionJobId) { this.ingestionJobId = ingestionJobId; }

    public Integer getExamSetIndex() { return examSetIndex; }
    public void setExamSetIndex(Integer examSetIndex) { this.examSetIndex = examSetIndex; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public double getTotalPoints() { return totalPoints; }
    public void setTotalPoints(double totalPoints) { this.totalPoints = totalPoints; }

    public double getDetectedPointsSum() { return detectedPointsSum; }
    public void setDetectedPointsSum(double detectedPointsSum) { this.detectedPointsSum = detectedPointsSum; }

    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }

    public boolean isHasPointMismatch() { return hasPointMismatch; }
    public void setHasPointMismatch(boolean hasPointMismatch) { this.hasPointMismatch = hasPointMismatch; }

    public List<String> getParserWarnings() { return parserWarnings; }
    public void setParserWarnings(List<String> parserWarnings) { this.parserWarnings = parserWarnings; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public List<DraftQuestion> getQuestions() { return questions; }
    public void setQuestions(List<DraftQuestion> questions) { this.questions = questions; }

    public DraftStatus getStatus() { return status; }
    public void setStatus(DraftStatus status) { this.status = status; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
}
