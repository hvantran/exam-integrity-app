package com.hoatv.exam.integrity.dtos;

public record UserProfileStatsDTO(
    int totalStars,
    int completedExams,
    double highestScore10
) {}

