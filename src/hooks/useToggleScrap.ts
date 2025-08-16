"use client"
import { useState, useEffect } from 'react';

interface ToggleScrapOptions {
  initialScrapped: boolean;
  initialCount: number;
  postId: number;
}

interface ScrapToggleResponse {
  postId: number;
  isScrapped: boolean;
  scrapCount: number;
}

export function useToggleScrap({ initialScrapped, initialCount, postId }: ToggleScrapOptions) {
  const [scrapped, setScrapped] = useState(initialScrapped);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // initialScrapped와 initialCount가 변경될 때 상태 업데이트
  useEffect(() => {
    setScrapped(initialScrapped);
    setCount(initialCount);
  }, [initialScrapped, initialCount]);

  const toggle = async () => {
    if (loading) return;
    
    console.log('useToggleScrap: 스크랩 토글 시작', { scrapped, count, postId });
    
    // 낙관적 업데이트
    setScrapped((prev) => !prev);
    setCount((prev) => (scrapped ? prev - 1 : prev + 1));

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/scrap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '스크랩 토글 실패');
      }
      
      const data: ScrapToggleResponse = await response.json();
      console.log('useToggleScrap: API 응답', data);
      
      // 서버 응답으로 상태 업데이트
      setScrapped(data.isScrapped);
      setCount(data.scrapCount);
    } catch (err) {
      console.error('useToggleScrap: 에러 발생', err);
      // 롤백
      setScrapped((prev) => !prev);
      setCount((prev) => (scrapped ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  };

  return { scrapped, count, loading, toggle };
}
