package com.hoatv.exam.integrity.dtos;

import java.time.Instant;

/** Summary row for student result history and teacher grading queues. */
public record SessionResultSummaryDTO(
    String sessionId,
    String examId,
    String examTitle,
    String studentId,
    String status,
    Instant submittedAt,
    double totalEarned,
    double totalMax,
    double finalScore10,
    int pendingEssayCount
) {}