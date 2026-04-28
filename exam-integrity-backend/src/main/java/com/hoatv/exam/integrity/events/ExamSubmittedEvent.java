package com.hoatv.exam.integrity.events;

import java.time.Instant;
import java.util.Map;

/** Published to Kafka topic 'exam.submitted' when a session is finalized. */
public record ExamSubmittedEvent(
    String sessionId,
    String examId,
    String studentId,
    Map<String, String> answers,   // questionId -> answer text
    Instant submittedAt,
    boolean forceSubmit            // true when triggered by timer expiry
) {}
