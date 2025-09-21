'use client';

import { Heart, Bookmark } from 'lucide-react';
import * as React from 'react';

type ReactionKind = 'like' | 'scrap';

interface ReactionButtonProps {
  kind: ReactionKind;
  active: boolean;
  count: number;
  pending?: boolean;
  onToggle: () => void;
  className?: string;
}

export function ReactionButton({
  kind,
  active,
  count,
  pending,
  onToggle,
  className = '',
}: ReactionButtonProps) {
  const testId = kind === 'like' ? 'like-button' : 'scrap-button';
  const countId = kind === 'like' ? 'like-count' : 'scrap-count';

  // 디버깅용 로그 (개발 환경에서만)
  // 디버깅 로그 제거 (무한 렌더링 방지)

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={active}
      aria-label={kind === 'like' ? (active ? '좋아요 취소' : '좋아요') : (active ? '스크랩 취소' : '스크랩')}
      data-testid={testId}
      data-state={active ? 'on' : 'off'}
      // E2E 호환: 기존 테스트가 기대하는 속성 유지
      {...(kind === 'like' ? { 'data-liked': active ? 'true' : 'false' } : { 'data-scraped': active ? 'true' : 'false' })}
      className={[
        // base
        'inline-flex items-center gap-1 text-sm transition-colors disabled:opacity-50 hover:scale-105',
        // 상태색: 공통 규약 (like=rose, scrap=amber)
        kind === 'like'
          ? active 
            ? 'text-rose-500 fill-rose-500' 
            : 'text-gray-400'
          : active 
            ? 'text-amber-500 fill-amber-500' 
            : 'text-gray-400',
        className,
      ].join(' ')}
    >
      {kind === 'like' ? (
        <Heart className={`h-4 w-4 ${active ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
      ) : (
        <Bookmark className={`h-4 w-4 ${active ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
      )}
      <span data-testid={countId}>{count}</span>
    </button>
  );
}
