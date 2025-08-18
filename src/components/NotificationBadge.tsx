"use client"
import { useSSENotifications } from "@/hooks/useSSENotifications"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  className?: string
  showCount?: boolean
  onClick?: () => void
}

export function NotificationBadge({ 
  className, 
  showCount = true, 
  onClick 
}: NotificationBadgeProps) {
  const { unreadCount, isConnected, error, reconnect } = useSSENotifications()

  return (
    <div className="relative">
      {/* 알림 아이콘 */}
      <button
        onClick={onClick}
        className={cn(
          "relative p-2 rounded-full hover:bg-gray-100 transition-colors",
          className
        )}
        title={error ? `연결 오류: ${error}` : "알림"}
      >
        <Bell className="w-5 h-5" />
        
        {/* 연결 상태 표시 */}
        <div className={cn(
          "absolute -top-1 -right-1 w-2 h-2 rounded-full",
          isConnected ? "bg-green-500" : "bg-red-500"
        )} />
      </button>

      {/* 읽지 않은 알림 개수 배지 */}
      {showCount && unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 text-xs font-bold"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}

      {/* 연결 오류 시 재연결 버튼 */}
      {error && (
        <button
          onClick={reconnect}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
        >
          재연결
        </button>
      )}
    </div>
  )
}

// 알림 개수만 표시하는 간단한 배지
export function NotificationCountBadge({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <Badge 
      variant="destructive" 
      className="min-w-[20px] h-5 px-1 text-xs font-bold"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  )
}
