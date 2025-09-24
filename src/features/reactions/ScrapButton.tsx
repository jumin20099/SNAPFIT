'use client';

import * as React from 'react';
import { ReactionButton } from '@/shared/ui/ReactionButton';
import { useToggleScrap } from '@/shared/hooks/useToggleScrap';
import { toast } from 'sonner';

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

  const { mutate, isPending } = useToggleScrap({
    postId,
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('스크랩 성공:', data);
      }
      setActive(data.scraped);
      setCount(data.count);
    },
    onError: (error) => {
      console.error('스크랩 에러:', error);
    },
  });

  const handleToggle = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.info('로그인 후 이용 가능합니다.');
      return;
    }

    mutate();
  };

  return (
    <ReactionButton
      kind="scrap"
      active={active}
      count={count}
      pending={isPending}
      onToggle={handleToggle}
      className={className}
    />
  );
}
