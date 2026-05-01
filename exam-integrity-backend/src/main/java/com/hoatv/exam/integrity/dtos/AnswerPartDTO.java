package com.hoatv.exam.integrity.dtos;

/** Structured student answer for one sub-question. */
public record AnswerPartDTO(
    String key,
    String answer
) {}