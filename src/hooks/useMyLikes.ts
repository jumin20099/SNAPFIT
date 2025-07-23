import { useEffect, useState } from 'react';

export interface LikeItem {
  likeIdx: number;
  targetIdx: number;
  targetType: 'PRODUCT' | 'OUTFIT' | 'OUTFIT_SHARE' | 'COMMENT';
  createdAt: string;
}

export function useMyLikes() {
  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/likes/my')
      .then((res) => res.json())
      .then(setLikes)
      .finally(() => setLoading(false));
  }, []);

  return { likes, loading };
} 