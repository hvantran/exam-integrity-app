package com.hoatv.exam.integrity.dtos;

/** Student's submitted answer for a single question. */
public record AnswerDTO(
    String questionId,
    String answer,
    boolean flaggedForReview
) {}
