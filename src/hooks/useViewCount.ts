"use client"
import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useViewCount(key: string, initialCount: number = 0) {
  const [count, setCount] = useState<number>(initialCount);

  useEffect(() => {
    if (!key) return;
    // 동일 출처 프록시(/ws) 사용. next.config.mjs에서 백엔드로 리라이트됨
    // 동일 출처 절대 URL 사용 (프록시 확실히 타게 함)
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const wsUrl = `${origin.replace(/\/$/, '')}/ws`;

    console.debug('[views]', 'init', { wsUrl, key });

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => console.debug('[stomp]', msg),
      onConnect: () => {
        console.debug('[views]', 'connected', { wsUrl, key });
        client.subscribe(`/topic/views/${key}`, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            console.debug('[views]', 'message', { key, payload });
            if (typeof payload?.count === 'number') {
              setCount(payload.count);
            }
          } catch (err) {
            console.debug('[views]', 'parse_error', { err });
          }
        });
      },
      onStompError: (frame) => {
        console.debug('[views]', 'stomp_error', frame.headers['message'], frame.body);
      },
      onWebSocketError: (event) => {
        console.debug('[views]', 'ws_error', event);
      },
      onWebSocketClose: (event) => {
        console.debug('[views]', 'ws_close', { code: event.code, reason: event.reason });
      },
      onDisconnect: () => {
        console.debug('[views]', 'disconnected');
      },
      onUnhandledMessage: (message) => {
        console.debug('[views]', 'unhandled_message', message);
      },
      onUnhandledFrame: (frame) => {
        console.debug('[views]', 'unhandled_frame', frame);
      },
    });
    // 가시적 연결 시도 로그
    try {
      client.activate();
      console.debug('[views]', 'activate called');
    } catch (e) {
      console.debug('[views]', 'activate error', e);
    }
    return () => {
      console.debug('[views]', 'deactivate');
      client.deactivate();
    };
  }, [key]);

  return count;
}