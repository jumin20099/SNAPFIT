'use client';

import { Bell } from 'lucide-react';
import { useNotificationContext } from './NotificationProvider';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
  onClick?: () => void;
}

export function NotificationBadge({ className, onClick }: NotificationBadgeProps) {
  const { unreadCount, isConnected } = useNotificationContext();

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
        className
      )}
    >
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      
      {/* 읽지 않은 알림 개수 배지 */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {/* 연결 상태 표시 */}
      {!isConnected && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-900" />
      )}
    </button>
  );
}
