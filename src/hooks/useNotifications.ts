import { useState, useEffect, useCallback } from 'react'

interface Notification {
  id: number
  type: "like" | "comment" | "follow" | "system"
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

  // 알림 목록 가져오기
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('알림을 가져오는데 실패했습니다')
      }
      
      const data = await response.json()
      setNotifications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  // 알림 읽음 처리
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
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
    } catch (err) {
      setError(err instanceof Error ? err.message : '읽음 처리에 실패했습니다')
    }
  }, [])

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('모든 알림 읽음 처리에 실패했습니다')
      }
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '모든 알림 읽음 처리에 실패했습니다')
    }
  }, [])

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
      
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 삭제에 실패했습니다')
    }
  }, [])

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
    } catch (err) {
      setError(err instanceof Error ? err.message : '모든 알림 삭제에 실패했습니다')
    }
  }, [])

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  }
}
