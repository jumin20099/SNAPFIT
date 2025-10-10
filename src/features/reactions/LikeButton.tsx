'use client';

import * as React from 'react';
import { ReactionButton } from '@/shared/ui/ReactionButton';
import { useToggleLike } from '@/shared/hooks/useToggleLike';
import { toast } from 'sonner';

type TargetType = 'product' | 'brand' | 'outfit' | 'post';

interface LikeButtonProps {
  targetIdx: number;
  targetType: TargetType;
  initialActive: boolean;   // 서버 DTO isLiked
  initialCount: number;     // 서버 likeCount
  className?: string;
  showCount?: boolean;
  onToggleSuccess?: (data: { liked: boolean; count: number; reactionStatus?: Record<string, { liked: boolean; likeCount: number; scraped?: boolean; scrapCount?: number }> }) => void;
  onToggleError?: (error: Error) => void;
}

export function LikeButton({
  targetIdx,
  targetType,
  initialActive,
  initialCount,
  className,
  showCount = true,
  onToggleSuccess,
  onToggleError,
}: LikeButtonProps) {
  const [active, setActive] = React.useState(initialActive);
  const [count, setCount] = React.useState(initialCount);

  // initialActive와 initialCount가 변경될 때만 상태 업데이트 (무한 루프 방지)
  const prevInitialActive = React.useRef(initialActive);
  const prevInitialCount = React.useRef(initialCount);

  React.useEffect(() => {
    if (prevInitialActive.current !== initialActive) {
      setActive(initialActive);
      prevInitialActive.current = initialActive;
    }
  }, [initialActive]);

  React.useEffect(() => {
    if (prevInitialCount.current !== initialCount) {
      setCount(initialCount);
      prevInitialCount.current = initialCount;
    }
  }, [initialCount]);

  const { mutate, isPending } = useToggleLike({
    targetIdx,
    targetType,
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('좋아요 성공:', data);
      }
      setActive(data.liked);
      setCount(data.count);
      onToggleSuccess?.(data);
    },
    onError: (error) => {
      console.error('좋아요 에러:', error);
      onToggleError?.(error);
    },
  });

  const handleToggle = () => {
    // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
    // 서버에서 자동으로 인증 처리
    mutate();
  };

  return (
    <ReactionButton
      kind="like"
      active={active}
      count={count}
      pending={isPending}
      onToggle={handleToggle}
      className={className}
      showCount={showCount}
    />
  );
}
