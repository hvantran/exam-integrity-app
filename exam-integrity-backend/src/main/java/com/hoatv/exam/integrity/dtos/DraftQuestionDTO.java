package com.hoatv.exam.integrity.dtos;

import java.util.List;

/**
 * Full question data for the review page.
 * Includes integrity metadata shown as warning badges in the UI.
 * Teacher edits are sent back via DraftQuestionEditCommand.
 */
public record DraftQuestionDTO(
    String id,
    int questionNumber,
    String content,
    String rawText,
    String type,
    double points,
    List<String> options,
    String correctAnswer,
    RubricDTO rubric,
    boolean truncated,

    // ── Integrity badges ──────────────────────────────────────────────────
    Double ocrConfidence,       // null = text PDF (no OCR)
    double parserConfidence,
    Integer pageNumber,
    List<String> parserWarnings,
    String reviewStatus         // PENDING | APPROVED | CORRECTED | EXCLUDED
) {}
