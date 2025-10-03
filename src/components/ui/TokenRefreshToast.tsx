/**
 * 토큰 갱신 토스트 컴포넌트
 * 백그라운드에서 토큰이 갱신될 때 사용자에게 알림을 표시합니다.
 */

import React from 'react';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface TokenRefreshToastProps {
  type: 'refreshing' | 'success' | 'error';
  message?: string;
}

export function showTokenRefreshToast({ type, message }: TokenRefreshToastProps) {
  const baseToast = {
    duration: type === 'refreshing' ? 0 : 3000, // 갱신 중일 때는 자동으로 사라지지 않음
  };

  switch (type) {
    case 'refreshing':
      toast.loading('세션을 갱신하고 있습니다...', {
        ...baseToast,
        id: 'token-refresh', // 동일한 ID로 중복 방지
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
      });
      break;

    case 'success':
      toast.dismiss('token-refresh'); // 갱신 중 토스트 제거
      toast.success(message || '세션이 갱신되었습니다.', {
        ...baseToast,
        icon: <CheckCircle className="w-4 h-4" />,
      });
      break;

    case 'error':
      toast.dismiss('token-refresh'); // 갱신 중 토스트 제거
      toast.error(message || '세션 갱신에 실패했습니다.', {
        ...baseToast,
        icon: <XCircle className="w-4 h-4" />,
      });
      break;
  }
}

export default function TokenRefreshToast() {
  // 이 컴포넌트는 실제로는 사용되지 않으며, showTokenRefreshToast 함수만 export
  return null;
}
