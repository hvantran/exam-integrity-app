package com.hoatv.exam.integrity.dtos;

import java.util.List;

/** Immutable transfer object for exam metadata sent to the UI. */
public record ExamDTO(
    String id,
    String title,
    int durationSeconds,
    double totalPoints,
    int questionCount,
    List<String> tags,
    List<QuestionSummaryDTO> questions
) {}
