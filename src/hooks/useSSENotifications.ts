import { useEffect, useRef, useState, useCallback } from "react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  image?: string;
  userName?: string;
  refId?: string;
}

interface UseSSENotificationsProps {
  onNotificationReceived?: (notification: Notification) => void;
  onUnreadCountUpdate?: (count: number) => void;
}

export function useSSENotifications(props?: UseSSENotificationsProps) {
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const retryRef = useRef(0);
  const stopRef = useRef(false);
  const esRef = useRef<EventSource | null>(null);
  const lastBeat = useRef<number>(Date.now());

  const reconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }
    setConnected(false);
    setError(null);
    retryRef.current = 0;
    // 즉시 재연결
    setTimeout(() => {
      if (!stopRef.current) {
        connect();
      }
    }, 100);
  }, []);

  const connect = useCallback(() => {
    // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
    // 서버에서 자동으로 인증 처리
    console.log("=== SSE 연결 시도 (HttpOnly 쿠키 기반) ===");
      return;
    }

    // 기존 연결이 있으면 먼저 닫기
    if (esRef.current) {
      esRef.current.close();
    }

    // HttpOnly 쿠키 기반 SSE 연결
    // EventSource는 자동으로 쿠키를 전송함
    const es = new EventSource(`/api/notifications/stream`);
    esRef.current = es;

    es.addEventListener("open", () => {
      console.log("=== SSE 연결 성공 ===");
      setConnected(true);
      setError(null);
      retryRef.current = 0;
    });

    es.addEventListener("heartbeat", () => {
      lastBeat.current = Date.now();
    });

    es.addEventListener("notification", (ev) => {
      try {
        console.log("=== SSE 알림 수신 ===", ev.data);
        const notification: Notification = JSON.parse(ev.data);
        
        // 알림 목록에 추가
        setNotifications(prev => [notification, ...prev]);
        
        // 읽지 않은 알림 개수 증가
        setUnreadCount(prev => prev + 1);
        
        // 부모 컴포넌트에 알림 전달
        if (props?.onNotificationReceived) {
          props.onNotificationReceived(notification);
        }
        
        // 부모 컴포넌트에 읽지 않은 알림 개수 전달
        if (props?.onUnreadCountUpdate) {
          props.onUnreadCountUpdate(unreadCount + 1);
        }
        
        console.log("=== 알림 상태 업데이트 완료 ===");
        console.log("새 알림:", notification);
        console.log("읽지 않은 알림 개수:", unreadCount + 1);
      } catch (e) {
        console.error("알림 파싱 오류:", e);
      }
    });

    es.addEventListener("notification-count", (ev) => {
      try {
        const count = parseInt(ev.data);
        setUnreadCount(count);
        console.log("=== SSE 알림 개수 업데이트 ===", count);
        
        // 부모 컴포넌트에 읽지 않은 알림 개수 전달
        if (props?.onUnreadCountUpdate) {
          props.onUnreadCountUpdate(count);
        }
      } catch (e) {
        console.error("알림 개수 파싱 오류:", e);
      }
    });

    es.onerror = (error) => {
      console.log("=== SSE 연결 오류 ===", error);
      setConnected(false);
      setError("연결 오류가 발생했습니다");
      es.close();
      if (stopRef.current) return;
      const delay = Math.min(30_000, 1000 * 2 ** (retryRef.current++));
      setTimeout(connect, delay);
    };
  }, []); // props 제거하여 무한 루프 방지

  useEffect(() => {
    connect();

    // heartbeat 와치독(선택): 40s 동안 심박 없으면 재연결
    const watchdog = setInterval(() => {
      if (Date.now() - lastBeat.current > 40_000) {
        console.log("=== SSE 하트비트 타임아웃: 재연결 시도 ===");
        esRef.current?.close();
        setConnected(false);
        setError("하트비트 타임아웃");
        retryRef.current = 0;
        connect();
      }
    }, 10_000);

    return () => {
      stopRef.current = true;
      clearInterval(watchdog);
      esRef.current?.close();
    };
  }, [connect]);

  return {
    connected, 
    unreadCount,
    notifications,
    error,
    reconnect,
    isConnected: connected // 별칭으로 제공
  };
}