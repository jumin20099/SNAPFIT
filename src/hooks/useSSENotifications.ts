import { useEffect, useRef, useState } from "react";

export function useSSENotifications() {
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const retryRef = useRef(0);
  const stopRef = useRef(false);
  const esRef = useRef<EventSource | null>(null);
  const lastBeat = useRef<number>(Date.now());

  const reconnect = () => {
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
  };

  const connect = () => {
    // JWT 토큰을 localStorage에서 가져오기 (키 이름: "token")
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("=== SSE 연결 실패: 토큰 없음 ===");
      setError("토큰이 없습니다");
      return;
    }

    console.log("=== SSE 연결 시도: 토큰 있음 ===");
    console.log("토큰 길이:", token.length);

    // ❗EventSource는 Authorization 헤더를 직접 보낼 수 없음
    // Next.js API 라우트에서 토큰을 쿠키로 설정하거나
    // URL 파라미터로 전달해야 함
    const es = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`);
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
      console.log("=== SSE 알림 수신 ===", ev.data);
      // TODO: 상태 업데이트/토스트 등
      // const payload = JSON.parse(ev.data);
    });

    es.addEventListener("notification-count", (ev) => {
      try {
        const count = parseInt(ev.data);
        setUnreadCount(count);
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
  };

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
  }, []);

  return { 
    connected, 
    unreadCount, 
    error, 
    reconnect,
    isConnected: connected // 별칭으로 제공
  };
}