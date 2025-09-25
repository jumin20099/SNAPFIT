'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Check, Trash2 } from 'lucide-react'
import { Button } from './button'
import { getAuthToken } from '@/lib/auth-utils'

interface Notification {
  id: string | number
  title: string
  message: string
  isRead?: boolean
  read?: boolean
  createdAt?: string
  timestamp?: string
  type: 'info' | 'success' | 'warning' | 'error' | 'LIKE'
}

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      // 실제 API에서 알림 데이터를 가져옴
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      // JWT 토큰 가져오기
      const token = getAuthToken()
      if (!token) {
        console.error('인증 토큰이 없습니다')
        setNotifications([])
        return
      }

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('알림 API 응답:', data)
        console.log('알림 데이터 타입:', typeof data)
        console.log('알림 데이터 길이:', Array.isArray(data) ? data.length : 'not array')
        
        // API 응답이 배열인 경우와 객체인 경우 모두 처리
        const notifications = Array.isArray(data) ? data : (data.content || [])
        console.log('처리된 알림 데이터:', notifications)
        setNotifications(notifications)
      } else {
        console.error('알림 데이터 로드 실패:', response.status)
        setNotifications([])
      }
    } catch (error) {
      console.error('알림 데이터 로드 중 오류:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const token = getAuthToken()
      if (!token) {
        console.error('인증 토큰이 없습니다')
        return
      }

      // 백엔드 API 호출 시도
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      })
      
      if (response.ok) {
        // 서버에서 성공적으로 처리된 경우
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, isRead: true, read: true }
              : notification
          )
        )
      } else {
        // 서버 오류 시 프론트엔드에서만 처리 (임시 해결)
        console.warn('서버 읽음 처리 실패, 프론트엔드에서 처리:', response.status)
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, isRead: true, read: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
      // 에러 발생 시에도 프론트엔드에서 처리 (임시 해결)
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true, read: true }
            : notification
        )
      )
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        console.error('인증 토큰이 없습니다')
        return
      }

      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // 서버에서 성공적으로 처리된 경우
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true, read: true }))
        )
      } else {
        // 서버 오류 시 프론트엔드에서만 처리 (임시 해결)
        console.warn('서버 전체 읽음 처리 실패, 프론트엔드에서 처리:', response.status)
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true, read: true }))
        )
      }
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error)
      // 에러 발생 시에도 프론트엔드에서 처리 (임시 해결)
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true, read: true }))
      )
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const token = getAuthToken()
      if (!token) {
        console.error('인증 토큰이 없습니다')
        return
      }

      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id))
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error)
    }
  }

  const unreadCount = notifications.filter(n => !(n.isRead || n.read)).length

  const formatDate = (dateString: string) => {
    if (!dateString) return '시간 정보 없음'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInHours < 48) return '어제'
    return date.toLocaleDateString('ko-KR')
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'LIKE': return 'text-pink-500'
      default: return 'text-blue-500'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* 모달 */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-md bg-white dark:bg-dark-sub rounded-lg shadow-xl max-h-[80vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-dark-text" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                    알림
                  </h2>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* 액션 버튼들 */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    모두 읽음
                  </Button>
                </div>
              )}

              {/* 알림 목록 */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm">알림이 없습니다</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-dark-border">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors ${
                          !(notification.isRead || notification.read) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(notification.type)}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className={`text-sm font-medium ${
                                !(notification.isRead || notification.read)
                                  ? 'text-gray-900 dark:text-dark-text' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-xs text-gray-400">
                                  {formatDate(notification.createdAt || notification.timestamp || '')}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(String(notification.id))}
                                  className="p-1 h-6 w-6 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            {!(notification.isRead || notification.read) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(String(notification.id))}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-700 p-0 h-auto"
                              >
                                읽음 처리
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
