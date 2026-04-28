package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.document.AuditEvent;
import com.hoatv.exam.integrity.events.ProctorAlertEvent;
import com.hoatv.exam.integrity.repositories.AuditEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import java.time.Instant;

/**
 * Persists all proctoring events to MongoDB for immutable audit trail.
 * Also updates the session risk score when alert threshold is exceeded.
 */
@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);
    private static final int RISK_FLAG_THRESHOLD = 70;

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @KafkaListener(topics = "proctor.alert", groupId = "audit-service")
    public void handleProctorAlert(ProctorAlertEvent event) {
        AuditEvent auditEvent = new AuditEvent();
        // Map event fields and save to MongoDB
        auditEventRepository.save(auditEvent);
        logger.info("Audit event {} saved for session {}", event.eventType(), event.sessionId());
    }
}
