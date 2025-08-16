"use client"
import { Heart, HeartOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LikeButtonProps {
  targetIdx: number;
  targetType: 'product' | 'brand' | 'outfit';
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ targetIdx, targetType, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  
  // 컴포넌트 마운트 시에만 실제 좋아요 상태 확인
  useEffect(() => {
    const checkActualLikeStatus = async () => {
      try {
        const response = await fetch('/api/likes/my', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const likes = await response.json();
          const isLiked = likes.some((like: any) => 
            like.targetIdx === targetIdx && like.targetType === targetType.toUpperCase()
          );
          
          // 초기 상태와 다를 때만 업데이트
          if (isLiked !== initialLiked) {
            setLiked(isLiked);
          }
        }
      } catch (error) {
        console.error('좋아요 상태 확인 실패:', error);
      }
    };
    
    checkActualLikeStatus();
  }, [targetIdx, targetType, initialLiked]);

  const toggle = async () => {
    if (loading) return;
    
    // optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(newLiked ? count + 1 : count - 1);
    setLoading(true);
    
    try {
      const params = new URLSearchParams({ 
        targetIdx: String(targetIdx), 
        targetType: targetType 
      });
      
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include',
        body: params
      });
      
      if (!response.ok) throw new Error('좋아요 토글 실패');
      
      const data = await response.json();
      // 서버 응답으로 상태 동기화
      setLiked(data.liked);
      setCount(data.count);
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      // rollback
      setLiked(!newLiked);
      setCount(newLiked ? count - 1 : count + 1);
    } finally {
      setLoading(false);
    }
  };

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