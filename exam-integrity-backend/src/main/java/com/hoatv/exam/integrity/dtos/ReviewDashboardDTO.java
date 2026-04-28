package com.hoatv.exam.integrity.dtos;

import java.util.List;

/** Full review dashboard sent after submission. */
public record ReviewDashboardDTO(
    String sessionId,
    double totalEarned,
    double totalMax,
    double finalScore10,
    List<Integer> missedQuestionNumbers,
    List<ScoreDTO> scores
) {}
