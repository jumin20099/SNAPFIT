"use client"

import { useState } from "react"
import { ArrowLeft, X, Heart, MessageSquare, UserPlus, Bell, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/useNotifications"

interface NotificationPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationPage({ isOpen, onClose }: NotificationPageProps) {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotifications()

  const [deletingId, setDeletingId] = useState<number | null>(null)

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "방금 전"
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}시간 전`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}일 전`

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}주 전`

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}개월 전`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />
      case "system":
        return <Bell className="w-5 h-5 text-gray-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const handleDeleteNotification = async (notificationId: number) => {
    setDeletingId(notificationId)
    try {
      await deleteNotification(notificationId)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteAll = async () => {
    if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
      await deleteAllNotifications()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">알림</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead} 
              className="text-blue-600 text-sm"
            >
              모두 읽음
            </Button>
          )}
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDeleteAll} 
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-500">알림을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <Bell className="w-16 h-16 mb-4 text-red-300" />
            <h3 className="text-lg font-medium mb-2">오류가 발생했습니다</h3>
            <p className="text-sm mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              다시 시도
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bell className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">알림이 없습니다</h3>
            <p className="text-sm">새로운 알림이 오면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-0 rounded-none ${!notification.read ? "bg-blue-50" : "bg-white"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar or Icon */}
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.avatar} alt={notification.userName} />
                          <AvatarFallback>{notification.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationIcon(notification.type)}
                            <span className="text-sm font-medium text-gray-900">{notification.title}</span>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{getTimeAgo(notification.timestamp)}</span>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 text-xs h-6 px-2"
                              >
                                읽음 처리
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Image if exists */}
                        {notification.image && (
                          <div className="ml-3 flex-shrink-0">
                            <img
                              src={notification.image}
                              alt="알림 이미지"
                              className="w-12 h-12 rounded object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={deletingId === notification.id}
                      className="p-1 h-6 w-6 text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      {deletingId === notification.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
