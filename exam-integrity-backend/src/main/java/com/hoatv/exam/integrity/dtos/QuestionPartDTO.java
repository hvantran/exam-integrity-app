package com.hoatv.exam.integrity.dtos;

/** Structured sub-question extracted from a multi-part essay prompt. */
public record QuestionPartDTO(
    String key,
    String prompt
) {}