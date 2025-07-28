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
    console.log('useMyLikes - 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
    
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('useMyLikes - Authorization 헤더 설정:', `Bearer ${token.substring(0, 50)}...`);
    } else {
      console.log('useMyLikes - 토큰이 없어서 Authorization 헤더를 설정하지 않음');
    }
    
    fetch('/api/likes/my', {
      headers
    })
      .then((res) => {
        console.log('useMyLikes - 응답 상태:', res.status);
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