package com.hoatv.exam.integrity.dtos;

public record GrowPetResponseDTO(
    StudentPetDTO pet,
    int remainingStars,
    boolean didEvolve,
    boolean levelGained
) {}

