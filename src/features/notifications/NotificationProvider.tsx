'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSSENotifications } from '@/hooks/useSSENotifications';
import { useNotifications } from '@/shared/api/queries';
import { toast } from 'sonner';

interface NotificationContextType {
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const queryClient = useQueryClient();
  
  // SSE 알림 연결 (임시로 비활성화)
  // const { 
  //   connected, 
  //   unreadCount: sseUnreadCount,
  //   notifications: sseNotifications 
  // } = useSSENotifications({
  
  // 임시로 기본값 사용
  const connected = false;
  const sseUnreadCount = 0;
  const sseNotifications: any[] = [];
  
  // useSSENotifications({
  //   onNotificationReceived: (notification) => {
  //     // 쿼리 무효화로 최신 알림 목록 가져오기
  //     queryClient.invalidateQueries({ queryKey: ['notifications'] });
  //     
  //     // 토스트 알림 표시
  //     toast.success(notification.title, {
  //       description: notification.message,
  //       duration: 5000,
  //       action: {
  //         label: '확인',
  //         onClick: () => {
  //           // 알림 상세 페이지로 이동하거나 모달 열기
  //           console.log('알림 확인:', notification);
  //         },
  //       },
  //     });
  //   },
  //   onUnreadCountUpdate: (count) => {
  //     // 전역 상태 업데이트 (필요시)
  //     console.log('읽지 않은 알림 개수 업데이트:', count);
  //   },
  // });

  // 기존 알림 데이터
  const { 
    data: notificationData,
    refetch: refetchNotifications 
  } = useNotifications();

  const unreadCount = sseUnreadCount ?? notificationData?.unreadCount ?? 0;

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    try {
      // API 호출
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      toast.error('알림 읽음 처리에 실패했습니다.');
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      toast.success('모든 알림을 읽음으로 표시했습니다.');
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
      toast.error('알림 읽음 처리에 실패했습니다.');
    }
  };

  // 연결 상태 모니터링
  useEffect(() => {
    if (!connected) {
      console.warn('SSE 연결이 끊어졌습니다. 재연결을 시도합니다.');
    }
  }, [connected]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        isConnected: connected,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
