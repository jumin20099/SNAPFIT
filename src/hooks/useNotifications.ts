import { useState, useCallback, useEffect } from 'react'
import { useSSENotifications } from './useSSENotifications'

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
  avatar?: string
  image?: string
  userName?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // SSE를 사용한 실시간 알림
  const { 
    unreadCount: realtimeUnreadCount, 
    markAsReadRealtime,
    updateUnreadCount 
  } = useSSENotifications()

  // 알림 목록 가져오기
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // JWT 토큰 가져오기
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('인증 토큰이 필요합니다')
      }
      
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('알림을 가져오는데 실패했습니다')
      }
      
      const data = await response.json()
      setNotifications(data)
      
      // 실시간 알림 카운트와 동기화
      const unreadCount = data.filter((n: Notification) => !n.read).length
      updateUnreadCount(unreadCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [updateUnreadCount])

  // 알림 읽음 처리
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('인증 토큰이 필요합니다')
      }
      
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('읽음 처리에 실패했습니다')
      }
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      
      // 실시간 알림 카운트 감소
      markAsReadRealtime()
    } catch (err) {
      setError(err instanceof Error ? err.message : '읽음 처리에 실패했습니다')
    }
  }, [markAsReadRealtime])

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('인증 토큰이 필요합니다')
      }
      
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('모든 알림 읽음 처리에 실패했습니다')
      }
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
      
      // 실시간 알림 카운트를 0으로 설정
      updateUnreadCount(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '모든 알림 읽음 처리에 실패했습니다')
    }
  }, [updateUnreadCount])

  // 알림 삭제
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('알림 삭제에 실패했습니다')
      }
      
      const deletedNotification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      )
      
      // 삭제된 알림이 읽지 않은 상태였다면 카운트 감소
      if (deletedNotification && !deletedNotification.read) {
        markAsReadRealtime()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 삭제에 실패했습니다')
    }
  }, [notifications, markAsReadRealtime])

  // 모든 알림 삭제
  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('모든 알림 삭제에 실패했습니다')
      }
      
      setNotifications([])
      
      // 실시간 알림 카운트를 0으로 설정
      updateUnreadCount(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '모든 알림 삭제에 실패했습니다')
    }
  }, [updateUnreadCount])

  // 컴포넌트 마운트 시 알림 목록 가져오기
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    error,
    unreadCount: realtimeUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  }
}
