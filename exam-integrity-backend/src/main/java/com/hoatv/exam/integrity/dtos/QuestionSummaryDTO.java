package com.hoatv.exam.integrity.dtos;

import java.util.List;

/** Per-question data for the exam session UI (one question at a time). */
public record QuestionSummaryDTO(
    String id,
    int questionNumber,
    String content,
    String type,
    double points,
    List<String> options,
    boolean truncated
) {}
