'use client';

import * as React from 'react';
import { ReactionButton } from '@/shared/ui/ReactionButton';
import { useToggleCommentLike } from '@/shared/hooks/useToggleCommentLike';

interface CommentLikeButtonProps {
  commentId: number;
  initialActive: boolean;   // 서버 DTO isLiked
  initialCount: number;     // 서버 likeCount
  className?: string;
}

export function CommentLikeButton({
  commentId,
  initialActive,
  initialCount,
  className,
}: CommentLikeButtonProps) {
  const [active, setActive] = React.useState(initialActive);
  const [count, setCount] = React.useState(initialCount);

  // initialActive가 변경되면 active 상태 업데이트
  // initialActive와 initialCount가 변경될 때만 상태 업데이트 (무한 루프 방지)
  const prevInitialActive = React.useRef(initialActive);
  const prevInitialCount = React.useRef(initialCount);

  React.useEffect(() => {
    if (prevInitialActive.current !== initialActive) {
      setActive(initialActive);
      prevInitialActive.current = initialActive;
    }
  });

  React.useEffect(() => {
    if (prevInitialCount.current !== initialCount) {
      setCount(initialCount);
      prevInitialCount.current = initialCount;
    }
  });

  const { mutate, isPending } = useToggleCommentLike({
    commentId,
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('댓글 좋아요 성공:', data);
      }
      setActive(data.liked);
      setCount(data.likeCount);
    },
    onError: (error) => {
      console.error('댓글 좋아요 에러:', error);
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
