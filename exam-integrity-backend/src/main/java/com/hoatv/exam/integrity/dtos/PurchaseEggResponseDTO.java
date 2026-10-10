package com.hoatv.exam.integrity.dtos;

public record PurchaseEggResponseDTO(
    boolean success,
    String message,
    IncubatingEggDTO incubatingEgg,
    int remainingStars
) {}

