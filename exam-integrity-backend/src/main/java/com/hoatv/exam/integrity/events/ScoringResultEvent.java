package com.hoatv.exam.integrity.events;

/** Consumed from Kafka topic 'scoring.result' produced by scoring-worker. */
public record ScoringResultEvent(
    String sessionId,
    String questionId,
    double earnedPoints,
    String scoreStatus,
    String scoreBreakdownJson
) {}
