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
        String stem,
        String type,
        double points,
        List<String> options,
        List<QuestionPartDTO> questionParts,
        String correctAnswer,
        RubricDTO rubric,
        boolean truncated,

        // ── Integrity badges ──────────────────────────────────────────────────
        String imageData, // Base64-encoded image data (Data URI)
        Double ocrConfidence, // null = text PDF (no OCR)
        double parserConfidence,
        Integer pageNumber,
        List<String> parserWarnings,
        String reviewStatus // PENDING | APPROVED | CORRECTED | EXCLUDED
) {
}
