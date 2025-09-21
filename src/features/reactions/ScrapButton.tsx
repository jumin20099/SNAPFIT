'use client';

import * as React from 'react';
import { ReactionButton } from '@/shared/ui/ReactionButton';
import { useToggleScrap } from '@/shared/hooks/useToggleScrap';

interface ScrapButtonProps {
  postId: number;
  initialActive: boolean;   // 서버 DTO isScrapped
  initialCount: number;     // 서버 scrapCount
  className?: string;
}

export function ScrapButton({
  postId,
  initialActive,
  initialCount,
  className,
}: ScrapButtonProps) {
  const [active, setActive] = React.useState(initialActive);
  const [count, setCount] = React.useState(initialCount);

  // initialActive가 변경되면 active 상태 업데이트
  React.useEffect(() => {
    setActive(initialActive);
  }, [initialActive]);

  // initialCount가 변경되면 count 상태 업데이트
  React.useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const { mutate, isPending } = useToggleScrap({
    postId,
    onSuccess: (data) => {
      console.log('스크랩 성공:', data);
      setActive(data.scraped);
      setCount(data.count);
    },
    onError: (error) => {
      console.error('스크랩 에러:', error);
    },
  });

  return (
    <ReactionButton
      kind="scrap"
      active={active}
      count={count}
      pending={isPending}
      onToggle={() => mutate()}
      className={className}
    />
  );
}
