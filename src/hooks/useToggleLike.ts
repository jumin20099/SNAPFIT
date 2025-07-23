import { useState } from 'react';

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

  const toggle = async () => {
    if (loading) return;
    // optimistic
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    setLoading(true);
    try {
      const params = new URLSearchParams({ targetIdx: String(targetIdx), targetType });
      const res = await fetch(`/api/likes/toggle?${params.toString()}`, { method: 'POST' });
      if (!res.ok) throw new Error('like failed');
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.count);
    } catch (e) {
      // rollback
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  };

  return { liked, count, loading, toggle };
} 