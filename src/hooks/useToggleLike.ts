"use client"
import { useState, useEffect } from 'react';

interface ToggleLikeOptions {
  initialLiked: boolean;
  initialCount: number;
  targetIdx: number;
  targetType: 'product' | 'brand' | 'outfit';
}

export function useToggleLike({ initialLiked, initialCount, targetIdx, targetType }: ToggleLikeOptions) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // initialLiked와 initialCount가 변경될 때 상태 업데이트
  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const toggle = async () => {
    if (loading) return;
    
    console.log('useToggleLike: 토글 시작', { liked, count, targetIdx, targetType });
    
    // optimistic
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    setLoading(true);
    try {
      const params = new URLSearchParams({ targetIdx: String(targetIdx), targetType });
      
      console.log('useToggleLike: API 호출', { targetIdx, targetType });
      
      const res = await fetch(`/api/likes/toggle`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include', // 쿠키 자동 전달
        body: params
      });
      
      if (!res.ok) throw new Error('like failed');
      const data = await res.json();
      console.log('useToggleLike: API 응답', data);
      
      setLiked(data.liked);
      setCount(data.count);
    } catch (e) {
      console.error('useToggleLike: 에러 발생', e);
      // rollback
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  };

  return { liked, count, loading, toggle };
} 