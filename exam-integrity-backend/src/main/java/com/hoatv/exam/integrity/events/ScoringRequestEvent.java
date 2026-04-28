package com.hoatv.exam.integrity.events;

/** Published to Kafka topic 'scoring.request' for essay questions only. */
public record ScoringRequestEvent(
    String sessionId,
    String questionId,
    String studentAnswer,
    String rubricJson,
    double maxPoints
) {}
