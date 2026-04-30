package com.hoatv.exam.integrity.dtos;

import java.util.List;

/**
 * Command sent by the teacher to update a single DraftQuestion during review.
 * Only editable fields are included — integrity metadata is read-only.
 */
public record DraftQuestionEditCommand(
    String content,
    String type,
    double points,
    List<String> options,
    String correctAnswer,
    RubricDTO rubric,
    String reviewStatus,   // APPROVED | CORRECTED | EXCLUDED
    String teacherNotes,
    String imageData
) {}
