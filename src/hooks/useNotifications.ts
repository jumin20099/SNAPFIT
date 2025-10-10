'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  isRead: boolean
}

interface NotificationResponse {
  notifications: Notification[]
  unreadCount: number
}

// 알림 목록 조회
const fetchNotifications = async (): Promise<NotificationResponse> => {
  const token = localStorage.getItem('token')
  
  const response = await fetch('/api/notifications', {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error('알림을 불러오는데 실패했습니다')
  }

  return response.json()
}

// 알림 읽음 처리
const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ isRead: true }),
  })

  if (!response.ok) {
    throw new Error('알림 읽음 처리에 실패했습니다')
  }
}

// 모든 알림 읽음 처리
const markAllNotificationsAsRead = async (): Promise<void> => {
  const token = localStorage.getItem('token')
  
  const response = await fetch('/api/notifications/read-all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error('모든 알림 읽음 처리에 실패했습니다')
  }
}

export function useNotifications() {
  const queryClient = useQueryClient()
  
  // 알림 목록 조회
  const { 
    data: notificationData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    staleTime: 10 * 1000, // 10초
    refetchInterval: 30 * 1000, // 30초마다 자동 새로고침
    retry: 1,
  })

  // 알림 읽음 처리 뮤테이션
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      console.error('알림 읽음 처리 실패:', error)
      toast.error('알림 읽음 처리에 실패했습니다')
    },
  })

  // 모든 알림 읽음 처리 뮤테이션
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('모든 알림을 읽음으로 표시했습니다')
    },
    onError: (error) => {
      console.error('모든 알림 읽음 처리 실패:', error)
      toast.error('알림 읽음 처리에 실패했습니다')
    },
  })

  // 알림 읽음 처리
  const markAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate(id)
  }, [markAsReadMutation])

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate()
  }, [markAllAsReadMutation])

  // 알림 삭제 (로컬 상태만)
  const removeNotification = useCallback((id: string) => {
    // 서버에서 알림 삭제 API가 있다면 여기에 추가
    console.log('알림 삭제:', id)
  }, [])

  // 오래된 알림 정리 (7일 이상)
  const cleanupOldNotifications = useCallback(() => {
    // 서버에서 자동으로 처리되므로 클라이언트에서는 불필요
    console.log('오래된 알림 정리')
  }, [])

  return {
    notifications: notificationData?.notifications || [],
    unreadCount: notificationData?.unreadCount || 0,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    cleanupOldNotifications,
    refetch
  }
}