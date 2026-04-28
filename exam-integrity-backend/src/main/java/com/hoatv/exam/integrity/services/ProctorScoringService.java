package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.ExamSession;
import com.hoatv.exam.integrity.events.ProctorAlertEvent;
import com.hoatv.exam.integrity.repositories.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * Accumulates risk score from proctor alert events.
 * Sessions with riskScore >= 70 are flagged for teacher review.
 */
@Service
public class ProctorScoringService {

    private static final Logger logger = LoggerFactory.getLogger(ProctorScoringService.class);
    private static final int FLAG_THRESHOLD = 70;

    private static final java.util.Map<String, Integer> RISK_WEIGHTS = java.util.Map.of(
        "TAB_BLUR",       5,
        "TAB_FOCUS",      0,
        "COPY_PASTE",     15,
        "CONTEXT_MENU",   5,
        "FULLSCREEN_EXIT", 20,
        "MULTIPLE_FACES", 30
    );

    private final SessionRepository sessionRepository;

    public ProctorScoringService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @KafkaListener(topics = "proctor.alert", groupId = "proctor-scoring")
    public void handleProctorAlert(ProctorAlertEvent event) {
        sessionRepository.findById(event.sessionId()).ifPresent(session -> {
            int delta = RISK_WEIGHTS.getOrDefault(event.eventType(), event.riskDelta());
            int newRisk = Math.min(100, session.getRiskScore() + delta);
            session.setRiskScore(newRisk);

            if (newRisk >= FLAG_THRESHOLD
                    && session.getStatus() == ExamSession.SessionStatus.ACTIVE) {
                session.setStatus(ExamSession.SessionStatus.FLAGGED);
                logger.warn("Session {} flagged — riskScore={}", event.sessionId(), newRisk);
            }
            sessionRepository.save(session);
        });
    }
}
