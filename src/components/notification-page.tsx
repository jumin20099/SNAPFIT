"use client"

import { useState, useEffect } from "react"
import { X, Bell, Check, Trash2, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useNotifications } from "@/hooks/useNotifications"

interface NotificationPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationPage({ isOpen, onClose }: NotificationPageProps) {
  const router = useRouter()
  const { notifications, loading, error, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [selectedNotification, setSelectedNotification] = useState<any>(null)

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId)
    }
    
    // 알림 타입에 따른 처리
    if (notification.type === 'LIKE') {
      handleLikeNotificationClick(notification)
    } else {
      setSelectedNotification(notification)
    }
  }

  const handleLikeNotificationClick = (notification: any) => {
    try {
      // 페이로드에서 게시글 ID 추출
      const payload = notification.payloadJson ? JSON.parse(notification.payloadJson) : {}
      const targetId = payload.targetId
      
      if (targetId) {
        // 게시글 상세 페이지로 이동
        router.push(`/community/${targetId}`)
        onClose() // 알림 모달 닫기
      } else {
        console.error('게시글 ID를 찾을 수 없습니다:', notification)
        setSelectedNotification(notification)
      }
    } catch (error) {
      console.error('좋아요 알림 처리 오류:', error)
      setSelectedNotification(notification)
    }
  }

  const handleClose = () => {
    setSelectedNotification(null)
    onClose()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return "방금 전"
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="w-5 h-5 text-red-500" />
      case "COMMENT":
        return "💬"
      case "FOLLOW":
        return "👥"
      case "SYSTEM":
        return "🔔"
      default:
        return "📢"
    }
  }

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "LIKE":
        return "좋아요"
      case "COMMENT":
        return "댓글"
      case "FOLLOW":
        return "팔로우"
      case "SYSTEM":
        return "시스템"
      default:
        return "알림"
    }
  }

  const getNotificationMessage = (notification: any) => {
    try {
      if (notification.payloadJson) {
        const payload = JSON.parse(notification.payloadJson)
        return payload.message || "새로운 알림이 도착했습니다."
      }
      return "새로운 알림이 도착했습니다."
    } catch (error) {
      return "새로운 알림이 도착했습니다."
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md" side="right">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림
            {notifications.length > 0 && (
              <span className="text-sm text-gray-500">({notifications.length})</span>
            )}
          </SheetTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <p>알림을 불러오는데 실패했습니다.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
                다시 시도
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>새로운 알림이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* 전체 읽음 처리 버튼 */}
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  읽지 않은 알림: {notifications.filter(n => !n.read).length}개
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={!notifications.some(n => !n.read)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  모두 읽음
                </Button>
              </div>

              {/* 알림 목록 */}
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {getNotificationTitle(notification.type)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {getNotificationMessage(notification)}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 알림 상세 모달 */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {getNotificationTitle(selectedNotification.type)}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedNotification(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="mb-4">
                <p className="text-gray-700">{getNotificationMessage(selectedNotification)}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDate(selectedNotification.createdAt)}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                  닫기
                </Button>
                {selectedNotification.type === 'LIKE' && (
                  <Button onClick={() => {
                    handleLikeNotificationClick(selectedNotification)
                    setSelectedNotification(null)
                  }}>
                    게시글 보기
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
