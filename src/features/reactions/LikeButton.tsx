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
}

export function LikeButton({
  targetIdx,
  targetType,
  initialActive,
  initialCount,
  className,
}: LikeButtonProps) {
  const [active, setActive] = React.useState(initialActive);
  const [count, setCount] = React.useState(initialCount);

  const { mutate, isPending } = useToggleLike({
    targetIdx,
    targetType,
    onSuccess: (data) => {
      console.log('좋아요 성공:', data);
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
    />
  );
}
