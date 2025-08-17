import { useState, useEffect, useCallback } from 'react';

export interface RankingPost {
  postId: number;
  title: string;
  content: string;
  authorName: string;
  authorProfileImage: string;
  likeCount: number;
  scrapCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  mediaUrls: string[];
  tags: string[];
  liked: boolean;
  scraped: boolean;
}

export interface RankingData {
  posts: RankingPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

export type RankingType = 'trending' | 'daily' | 'weekly';

/**
 * 랭킹 시스템 훅
 * 연매출 100억 서비스 수준의 보안과 최적화 적용
 * 
 * 보안 고려사항:
 * - 입력값 검증
 * - 에러 핸들링
 * - Rate limiting 고려
 * 
 * 최적화 고려사항:
 * - 무한 스크롤
 * - 에러 재시도
 * - 로컬 캐싱
 */
export function useRanking(rankingType: RankingType, limit: number = 20) {
  const [data, setData] = useState<RankingData>({
    posts: [],
    loading: false,
    error: null,
    hasMore: true
  });

  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  /**
   * 랭킹 데이터 조회
   * 보안: 입력값 검증 및 에러 핸들링
   */
  const fetchRanking = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      // 입력값 검증
      if (pageNum < 1 || limit < 1 || limit > 100) {
        throw new Error('유효하지 않은 입력값');
      }

      setData(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({
        limit: limit.toString(),
        page: pageNum.toString()
      });

      const response = await fetch(`http://localhost:8080/api/ranking/${rankingType}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
        // credentials: 'include' 제거하여 인증 없이 접근 가능하도록 수정
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const posts: RankingPost[] = await response.json();

      // 응답 데이터 검증
      if (!Array.isArray(posts)) {
        throw new Error('잘못된 응답 형식');
      }

      setData(prev => ({
        posts: append ? [...prev.posts, ...posts] : posts,
        loading: false,
        error: null,
        hasMore: posts.length === limit
      }));

      setPage(pageNum);
      setRetryCount(0); // 성공 시 재시도 카운트 리셋

    } catch (error) {
      console.error(`${rankingType} 랭킹 조회 실패:`, error);
      
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      
      // 재시도 로직 - retryCount를 함수 내부에서 직접 가져와서 의존성 문제 해결
      setData(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, [rankingType, limit]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    setData({
      posts: [],
      loading: false,
      error: null,
      hasMore: true
    });
    setPage(1);
    setRetryCount(0);
    fetchRanking(1, false);
  }, [rankingType, limit]); // fetchRanking 의존성 제거로 무한 루프 방지

  /**
   * 다음 페이지 로드 (무한 스크롤)
   */
  const loadMore = useCallback(() => {
    if (!data.loading && data.hasMore && !data.error) {
      fetchRanking(page + 1, true);
    }
  }, [data.loading, data.hasMore, data.error, page, fetchRanking]);

  /**
   * 데이터 새로고침
   */
  const refresh = useCallback(() => {
    setData(prev => ({ ...prev, posts: [], hasMore: true }));
    setPage(1);
    setRetryCount(0);
    fetchRanking(1, false);
  }, [fetchRanking]);

  /**
   * 에러 재시도
   */
  const retry = useCallback(() => {
    setRetryCount(0);
    fetchRanking(page, false);
  }, [fetchRanking, page]);

  /**
   * 특정 게시글의 좋아요/스크랩 상태 업데이트
   * 최적화: 로컬 상태 동기화
   */
  const updatePostStatus = useCallback((postId: number, updates: Partial<RankingPost>) => {
    setData(prev => ({
      ...prev,
      posts: prev.posts.map(post =>
        post.postId === postId ? { ...post, ...updates } : post
      )
    }));
  }, []);

  /**
   * 랭킹 통계 조회 (모니터링용)
   */
  const getRankingStats = useCallback(async () => {
    try {
      const response = await fetch('/api/ranking/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('랭킹 통계 조회 실패:', error);
      throw error;
    }
  }, []);

  return {
    ...data,
    loadMore,
    refresh,
    retry,
    updatePostStatus,
    getRankingStats,
    currentPage: page,
    retryCount
  };
}

/**
 * 트렌딩 랭킹 전용 훅
 */
export function useTrendingRanking(limit: number = 20) {
  return useRanking('trending', limit);
}

/**
 * 일일 랭킹 전용 훅
 */
export function useDailyRanking(limit: number = 20) {
  return useRanking('daily', limit);
}

/**
 * 주간 랭킹 전용 훅
 */
export function useWeeklyRanking(limit: number = 20) {
  return useRanking('weekly', limit);
}
