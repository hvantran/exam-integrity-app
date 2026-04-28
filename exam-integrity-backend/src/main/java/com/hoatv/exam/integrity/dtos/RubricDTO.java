package com.hoatv.exam.integrity.dtos;

import java.util.List;

/**
 * Rubric data used in both DraftQuestion review and final Exam display.
 * Teacher fills this in during the review phase for essay questions.
 */
public record RubricDTO(
    List<String> keywords,
    List<String> expectedSteps,
    String finalAnswer,
    String modelAnswer,
    List<String> formatChecks
) {}
