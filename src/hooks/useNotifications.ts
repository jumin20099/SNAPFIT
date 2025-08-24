import { useState, useEffect } from "react";
import { useSSENotifications } from "./useSSENotifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    unreadCount: realtimeUnreadCount
  } = useSSENotifications()

  // 기존 알림 목록 가져오기
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("토큰이 없습니다");
        return;
      }

      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err: any) {
      console.error("알림 가져오기 실패:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 모든 알림을 읽음으로 표시
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("토큰이 없습니다");
        return;
      }

      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      setError(null);
    } catch (err: any) {
      console.error("모든 알림 읽음 표시 실패:", err);
      setError(err.message);
    }
  };

  // 특정 알림을 읽음으로 표시
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("토큰이 없습니다");
        return;
      }

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // 읽지 않은 알림 개수 감소
      setUnreadCount(prev => Math.max(0, prev - 1));
      setError(null);
    } catch (err: any) {
      console.error("알림 읽음 표시 실패:", err);
      setError(err.message);
    }
  };

  // 컴포넌트 마운트 시 알림 가져오기
  useEffect(() => {
    fetchNotifications();
  }, []);

  // 실시간 알림 개수 업데이트
  useEffect(() => {
    if (realtimeUnreadCount !== undefined) {
      setUnreadCount(realtimeUnreadCount);
    }
  }, [realtimeUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
  };
}