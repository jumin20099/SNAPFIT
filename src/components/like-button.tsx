"use client"
import { Heart, HeartOff } from 'lucide-react';
import { useToggleLike } from '@/hooks/useToggleLike';
import { useEffect, useState } from 'react';

interface LikeButtonProps {
  targetIdx: number;
  targetType: 'product' | 'brand' | 'outfit';
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ targetIdx, targetType, initialLiked, initialCount }: LikeButtonProps) {
  const [actualLiked, setActualLiked] = useState(initialLiked);
  const [actualCount, setActualCount] = useState(initialCount);
  
  // 컴포넌트 마운트 시 실제 좋아요 상태 확인
  useEffect(() => {
    const checkActualLikeStatus = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/likes/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const likes = await response.json();
          const isLiked = likes.some((like: any) => 
            like.targetIdx === targetIdx && like.targetType === targetType.toUpperCase()
          );
          
          if (isLiked !== actualLiked) {
            setActualLiked(isLiked);
          }
        }
      } catch (error) {
        console.error('좋아요 상태 확인 실패:', error);
      }
    };
    
    checkActualLikeStatus();
  }, [targetIdx, targetType, actualLiked]);

  const { liked, count, loading, toggle } = useToggleLike({
    initialLiked: actualLiked,
    initialCount: actualCount,
    targetIdx,
    targetType,
  });

  // 좋아요 상태가 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    if (liked !== actualLiked) {
      setActualLiked(liked);
    }
    if (count !== actualCount) {
      setActualCount(count);
    }
  }, [liked, count, actualLiked, actualCount]);

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1 text-sm ${liked ? 'filled' : ''}`}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      data-testid="like-button"
    >
      {liked ? <Heart className="fill-red-500 text-red-500 w-4 h-4" /> : <HeartOff className="w-4 h-4" />}
      <span>{count}</span>
    </button>
  );
} 