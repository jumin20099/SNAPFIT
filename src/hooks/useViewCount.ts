"use client"
import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useViewCount(key: string) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!key) return;
    const wsBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL ||
      'http://localhost:8080';

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBase}/ws`),
      onConnect: () => {
        client.subscribe(`/topic/views/${key}`, (msg) => {
          const payload = JSON.parse(msg.body);
          setCount(payload.count);
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