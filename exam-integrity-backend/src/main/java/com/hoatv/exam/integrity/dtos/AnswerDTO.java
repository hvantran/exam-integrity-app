package com.hoatv.exam.integrity.dtos;

import java.util.List;

/** Student's submitted answer for a single question. */
public record AnswerDTO(
    String questionId,
    String answer,
    boolean flaggedForReview,
    List<AnswerPartDTO> answerParts
) {}
