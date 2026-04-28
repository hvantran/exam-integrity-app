package com.hoatv.exam.integrity.dtos;

/** Score result per question returned in the review dashboard. */
public record ScoreDTO(
    String questionId,
    int questionNumber,
    double earnedPoints,
    double maxPoints,
    String status,
    String studentAnswer,
    String correctAnswer,
    String explanation,
    String scoreBreakdownJson
) {}
