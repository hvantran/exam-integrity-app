package com.hoatv.exam.integrity.events;

import java.time.Instant;

/** Published to Kafka topic 'proctor.alert' for anti-cheat events. */
public record ProctorAlertEvent(
    String sessionId,
    String studentId,
    String eventType,    // TAB_BLUR | FULLSCREEN_EXIT | COPY_PASTE | MULTIPLE_FACES
    int riskDelta,
    Instant occurredAt
) {}
