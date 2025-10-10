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
    
    // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
    // 서버에서 자동으로 인증 처리
    const headers: HeadersInit = {};
    
    fetch('/api/likes/my', {
      headers,
      credentials: 'include' // HttpOnly 쿠키 자동 전송
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