package com.hoatv.exam.integrity.dtos;

import java.time.Instant;
import java.util.List;

/**
 * Summary card shown in the teacher's draft list page.
 * Does NOT include full question content (too large).
 */
public record ExamDraftSummaryDTO(
    String draftId,
    String title,
    String originalFilename,
    String pdfType,
    boolean ocrUsed,
    Double documentOcrConfidence,
    int totalQuestions,
    int flaggedQuestionCount,
    boolean hasPointMismatch,
    double totalPoints,
    double detectedPointsSum,
    List<String> tags,
    String status,
    Instant uploadedAt,
    String uploadedBy
) {}
