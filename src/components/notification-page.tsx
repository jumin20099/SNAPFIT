"use client"

import { useRouter } from "next/navigation";
import { useNotifications } from "../hooks/useNotifications";
import { useSSENotifications } from "../hooks/useSSENotifications";
import { useState, useEffect } from "react";

interface NotificationPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPage({ isOpen, onClose }: NotificationPageProps) {
  const router = useRouter()
  const { notifications: staticNotifications, loading, error, markAsRead, markAllAsRead } = useNotifications()
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  
  // SSE 실시간 알림 훅
  const { 
    notifications: realtimeNotifications, 
    unreadCount: realtimeUnreadCount,
    connected: sseConnected 
  } = useSSENotifications({
    onNotificationReceived: (notification) => {
      console.log("=== 알림 페이지에서 새 알림 수신 ===", notification);
      // 실시간 알림이 오면 자동으로 알림 목록에 추가됨
    },
    onUnreadCountUpdate: (count) => {
      console.log("=== 알림 페이지에서 읽지 않은 알림 개수 업데이트 ===", count);
    }
  });

  // 실시간 알림과 정적 알림을 합쳐서 표시
  const allNotifications = [...realtimeNotifications, ...staticNotifications];
  const totalUnreadCount = realtimeUnreadCount + (staticNotifications.filter(n => !n.read).length || 0);

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    // 읽음 처리
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleClose = () => {
    setSelectedNotification(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">알림</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* SSE 연결 상태 표시 */}
        <div className="mb-4 p-2 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${sseConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              {sseConnected ? '실시간 연결됨' : '실시간 연결 안됨'}
            </span>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            읽지 않은 알림: {totalUnreadCount}개
          </div>
        </div>

        {/* 알림 목록 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">알림을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>알림을 불러오는데 실패했습니다.</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-600">새로운 알림이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {notification.type === 'LIKE' ? '❤️' : '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString('ko-KR')}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 모든 알림 읽음 처리 버튼 */}
        {allNotifications.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={markAllAsRead}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              모든 알림 읽음 처리
            </button>
          </div>
        )}

        {/* 알림 상세 보기 */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">알림 상세</h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-gray-700">제목:</label>
                  <p className="text-gray-900">{selectedNotification.title}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">내용:</label>
                  <p className="text-gray-900">{selectedNotification.message}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">시간:</label>
                  <p className="text-gray-900">
                    {new Date(selectedNotification.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">타입:</label>
                  <p className="text-gray-900">{selectedNotification.type}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
