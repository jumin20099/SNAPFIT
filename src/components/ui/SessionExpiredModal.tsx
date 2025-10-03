/**
 * 세션 만료 모달 컴포넌트
 * 토큰 갱신 실패 시 사용자에게 알림을 표시합니다.
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onLogout: () => void;
  isRetrying?: boolean;
}

export function SessionExpiredModal({ 
  isOpen, 
  onRetry, 
  onLogout, 
  isRetrying = false 
}: SessionExpiredModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                세션이 만료되었습니다
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                보안을 위해 자동으로 로그아웃됩니다.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            세션이 만료되어 다시 로그인이 필요합니다. 
            계속 사용하려면 다시 로그인해주세요.
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                재시도 중...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </>
            )}
          </Button>
          <Button
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            로그아웃
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
