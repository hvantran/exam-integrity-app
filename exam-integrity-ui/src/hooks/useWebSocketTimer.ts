/** FE-12: STOMP WebSocket timer with REST fallback */
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { sessionService } from '../services/sessionService';
import type { TimerTickMessage } from '../types/exam.types';

const WS_URL = process.env.REACT_APP_WS_URL ?? 'http://localhost:8090/exam-integrity-backend';

interface UseWebSocketTimerResult {
  remaining: number | null;
  forceSubmit: boolean;
}

export function useWebSocketTimer(sessionId: string, onForceSubmit?: () => void): UseWebSocketTimerResult {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [forceSubmit, setForceSubmit] = useState(false);
  const stompRef = useRef<Client | null>(null);
  const hasForcedSubmitRef = useRef(false);

  useEffect(() => {
    hasForcedSubmitRef.current = false;
    setForceSubmit(false);
    setRemaining(null);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    let pollId: number | null = null;

    const triggerForceSubmit = () => {
      if (hasForcedSubmitRef.current) return;
      hasForcedSubmitRef.current = true;
      setForceSubmit(true);
      onForceSubmit?.();
    };

    const pollTimer = async () => {
      try {
        const seconds = await sessionService.getTimer(sessionId);
        setRemaining(seconds);
        if (seconds <= 0) triggerForceSubmit();
      } catch {
        // Ignore polling failures and keep the last known timer value.
      }
    };

    const startPolling = () => {
      if (pollId === null) {
        void pollTimer();
        pollId = window.setInterval(pollTimer, 1000);
      }
    };

    const stopPolling = () => {
      if (pollId !== null) {
        window.clearInterval(pollId);
        pollId = null;
      }
    };

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws/exam`) as WebSocket,
      debug: () => {},
      onConnect: () => {
        stopPolling(); // WebSocket is up — REST polling not needed
        client.subscribe(`/topic/session/${sessionId}`, (msg: IMessage) => {
          try {
            const tick: TimerTickMessage = JSON.parse(msg.body);
            if (tick.type === 'TICK' && tick.remaining != null) {
              setRemaining(tick.remaining);
            } else if (tick.type === 'FORCE_SUBMIT') {
              triggerForceSubmit();
            }
          } catch {
            // ignore malformed messages
          }
        });
      },
      onStompError: () => {
        // WS connection failed — fall back to REST polling
        startPolling();
      },
      onDisconnect: () => {
        // WS disconnected unexpectedly — fall back to REST polling
        startPolling();
      },
    });
    stompRef.current = client;
    client.activate();

    // Start REST polling immediately; it will be stopped once WebSocket connects
    startPolling();

    return () => {
      stopPolling();
      client.deactivate();
    };
  }, [sessionId, onForceSubmit]);

  return { remaining, forceSubmit };
}
