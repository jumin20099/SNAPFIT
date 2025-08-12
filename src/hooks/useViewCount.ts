"use client"
import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useViewCount(key: string, initialCount: number = 0) {
  const [count, setCount] = useState<number>(initialCount);

  useEffect(() => {
    if (!key) return;
    // 동일 출처 프록시(/ws) 사용. next.config.mjs에서 백엔드로 리라이트됨
    const envBase =
      process.env.NEXT_PUBLIC_WS_BASE ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL ||
      '';

    const wsUrl = `${envBase}`.replace(/\/$/, '') + '/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        client.subscribe(`/topic/views/${key}`, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            if (typeof payload?.count === 'number') {
              setCount(payload.count);
            }
          } catch (_) {
            // ignore malformed payload
          }
        });
      },
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [key]);

  return count;
}