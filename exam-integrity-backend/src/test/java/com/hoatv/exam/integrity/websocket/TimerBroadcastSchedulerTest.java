package com.hoatv.exam.integrity.websocket;

import com.hoatv.exam.integrity.services.SessionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.CONFLICT;

@ExtendWith(MockitoExtension.class)
class TimerBroadcastSchedulerTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private SessionService sessionService;

    @Test
    void broadcastTimersSubmitsTimedOutSessionBeforeSendingForceSubmitMessage() {
        TimerBroadcastScheduler scheduler = new TimerBroadcastScheduler(messagingTemplate, sessionService);

        when(sessionService.getActiveSessionIds()).thenReturn(Set.of("session-timeout"));
        when(sessionService.getRemainingSeconds("session-timeout")).thenReturn(0L);

        scheduler.broadcastTimers();

        InOrder inOrder = inOrder(sessionService, messagingTemplate);
        inOrder.verify(sessionService).submitExam("session-timeout", true);
        inOrder.verify(messagingTemplate).convertAndSend(
            "/topic/session/session-timeout",
            Map.of("type", "FORCE_SUBMIT")
        );
        verify(sessionService).getRemainingSeconds("session-timeout");
    }

    @Test
    void broadcastTimersSkipsForceSubmitMessageWhenSessionAlreadySubmitted() {
        TimerBroadcastScheduler scheduler = new TimerBroadcastScheduler(messagingTemplate, sessionService);

        when(sessionService.getActiveSessionIds()).thenReturn(Set.of("session-stale"));
        when(sessionService.getRemainingSeconds("session-stale")).thenReturn(0L);
        doThrow(new ResponseStatusException(CONFLICT, "Already submitted"))
            .when(sessionService).submitExam("session-stale", true);

        scheduler.broadcastTimers();

        // submitExam called but FORCE_SUBMIT must NOT be broadcast for already-submitted sessions
        verify(sessionService).submitExam("session-stale", true);
        verify(messagingTemplate, never()).convertAndSend(
            "/topic/session/session-stale",
            Map.of("type", "FORCE_SUBMIT")
        );
    }
}