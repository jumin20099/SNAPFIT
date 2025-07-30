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
    
    // Authorization 헤더 가져오기
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      
    } else {
      
    }
    
    fetch('/api/likes/my', {
      headers
    })
      .then((res) => {
  
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setLikes)
      .catch((error) => {
        console.error('좋아요 목록 가져오기 실패:', error);
        setLikes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { likes, loading };
} 