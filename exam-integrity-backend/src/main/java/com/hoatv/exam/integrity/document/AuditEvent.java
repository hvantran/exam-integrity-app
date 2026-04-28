package com.hoatv.exam.integrity.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;

/**
 * Immutable audit record captured for every user interaction.
 * Stored in MongoDB for post-exam integrity review.
 * Never updated — only inserted.
 *
 * Collection: audit_events
 */
@Document(collection = "audit_events")
public class AuditEvent {

    @Id
    private String id;

    @Indexed
    private String sessionId;

    @Indexed
    private String studentId;

    /**
     * Event type enum string. Known values:
     *   TAB_BLUR, TAB_FOCUS, COPY_PASTE, CONTEXT_MENU, FULLSCREEN_EXIT,
     *   EXAM_STARTED, EXAM_SUBMITTED, FORCE_SUBMITTED
     */
    private String eventType;

    /**
     * JSON payload with event-specific metadata.
     * TAB_BLUR: {"duration_ms": 3200}
     * COPY_PASTE: {"questionId": "abc"}
     * FORCE_SUBMITTED: {"reason": "TIMER_EXPIRED"}
     */
    private String payload;

    private Instant occurredAt;

    /** Remote IP address of the student's device. */
    private String ipAddress;

    /**
     * Browser fingerprint hash (User-Agent + screen resolution + timezone).
     * Used to detect device switching mid-exam.
     */
    private String deviceFingerprint;

    // ----- Getters & Setters -----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(Instant occurredAt) { this.occurredAt = occurredAt; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getDeviceFingerprint() { return deviceFingerprint; }
    public void setDeviceFingerprint(String deviceFingerprint) { this.deviceFingerprint = deviceFingerprint; }
}
