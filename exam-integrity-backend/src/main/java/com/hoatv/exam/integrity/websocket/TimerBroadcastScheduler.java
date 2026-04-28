package com.hoatv.exam.integrity.websocket;

import com.hoatv.exam.integrity.services.SessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

/**
 * Pushes remaining-time ticks to all active WebSocket subscribers every second.
 * When time reaches 0, triggers FORCE_SUBMIT and sends the signal to the client.
 *
 * Client listens on: /topic/session/{sessionId}
 */
@Component
public class TimerBroadcastScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TimerBroadcastScheduler.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final SessionService sessionService;

    public TimerBroadcastScheduler(SimpMessagingTemplate messagingTemplate,
                                    SessionService sessionService) {
        this.messagingTemplate = messagingTemplate;
        this.sessionService    = sessionService;
    }

    @Scheduled(fixedDelay = 1000)
    public void broadcastTimers() {
        Set<String> activeIds = sessionService.getActiveSessionIds();
        for (String sessionId : activeIds) {
            long remaining = sessionService.getRemainingSeconds(sessionId);
            pushToSession(sessionId, remaining);
            if (remaining <= 0) {
                try {
                    sessionService.submitExam(sessionId, true);
                } catch (Exception e) {
                    // Already submitted — safe to ignore
                    logger.debug("Force-submit skipped for session {}: {}", sessionId, e.getMessage());
                }
            }
        }
    }

    private void pushToSession(String sessionId, long remaining) {
        String destination = "/topic/session/" + sessionId;
        if (remaining <= 0) {
            messagingTemplate.convertAndSend(destination, Map.of("type", "FORCE_SUBMIT"));
            logger.info("FORCE_SUBMIT sent to session {}", sessionId);
        } else {
            messagingTemplate.convertAndSend(destination, Map.of("type", "TICK", "remaining", remaining));
        }
    }
}
