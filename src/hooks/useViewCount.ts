import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useViewCount(key: string) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!key) return;
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe(`/topic/views/${key}`, (msg) => {
          const payload = JSON.parse(msg.body);
          setCount(payload.count);
        });
      },
    });
    client.activate();
    return () => client.deactivate();
  }, [key]);

  return count;
} 