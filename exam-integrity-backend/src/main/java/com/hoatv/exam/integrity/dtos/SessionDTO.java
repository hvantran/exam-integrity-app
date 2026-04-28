package com.hoatv.exam.integrity.dtos;

import java.time.Instant;

/** Session state returned after creation or status check. */
public record SessionDTO(
    String sessionId,
    String examId,
    String studentId,
    String status,
    Instant startedAt,
    long remainingSeconds
) {}
