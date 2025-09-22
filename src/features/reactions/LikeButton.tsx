'use client';

import * as React from 'react';
import { ReactionButton } from '@/shared/ui/ReactionButton';
import { useToggleLike } from '@/shared/hooks/useToggleLike';

type TargetType = 'product' | 'brand' | 'outfit';

interface LikeButtonProps {
  targetIdx: number;
  targetType: TargetType;
  initialActive: boolean;   // 서버 DTO isLiked
  initialCount: number;     // 서버 likeCount
  className?: string;
  showCount?: boolean;
}

export function LikeButton({
  targetIdx,
  targetType,
  initialActive,
  initialCount,
  className,
  showCount = true,
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
    },
    onError: (error) => {
      console.error('좋아요 에러:', error);
    },
  });

  return (
    <ReactionButton
      kind="like"
      active={active}
      count={count}
      pending={isPending}
      onToggle={() => mutate()}
      className={className}
      showCount={showCount}
    />
  );
}
