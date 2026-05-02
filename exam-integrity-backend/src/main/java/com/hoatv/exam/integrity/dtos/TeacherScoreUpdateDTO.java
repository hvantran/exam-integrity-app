package com.hoatv.exam.integrity.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/** Teacher-provided score update for an essay question. */
public record TeacherScoreUpdateDTO(
    @NotNull @DecimalMin("0.0") Double earnedPoints,
    String explanation
) {}