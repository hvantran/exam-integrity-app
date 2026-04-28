/** FE-12: STOMP WebSocket timer with REST fallback */
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
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

  useEffect(() => {
    if (!sessionId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws/exam`) as WebSocket,
      debug: () => {},
      onConnect: () => {
        client.subscribe(`/topic/session/${sessionId}`, (msg: IMessage) => {
          try {
            const tick: TimerTickMessage = JSON.parse(msg.body);
            if (tick.type === 'TICK' && tick.remaining != null) {
              setRemaining(tick.remaining);
            } else if (tick.type === 'FORCE_SUBMIT') {
              setForceSubmit(true);
              onForceSubmit?.();
            }
          } catch {
            // ignore malformed messages
          }
        });
      },
      onStompError: () => {
        // WS connection failed — fallback handled by useSession refetch
      },
    });
    stompRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [sessionId, onForceSubmit]);

  return { remaining, forceSubmit };
}
