"use client"
import { useState, useEffect, useCallback, useRef } from 'react';
import { useBatchReactionStatus } from '@/shared/hooks/useBatchReactionStatus';

interface Post {
  postId: number;
  title: string;
  content: string;
  tags: string[];
  mediaUrls: string[];
  authorId: string;
  authorName: string;
  authorProfileImage: string;
  likeCount: number;
  scrapCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  isScrapped: boolean;
}

interface PostsResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface UseInfinitePostsOptions {
  pageSize?: number;
  sortBy?: 'latest' | 'trending' | 'popular';
  userId?: string;
  tag?: string;
}

interface UseInfinitePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  resetError: () => void;
}

export function useInfinitePosts(options: UseInfinitePostsOptions = {}): UseInfinitePostsReturn {
  const { pageSize = 10, sortBy = 'latest', userId, tag } = options;
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // 배치 상태 조회 훅
  const { data: batchReactionStatus, manager: reactionManager } = useBatchReactionStatus({
    postIds: posts.map(p => p.postId),
    enabled: posts.length > 0
  });

  const buildApiUrl = useCallback((page: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    });

          if (sortBy === 'trending') {
        return `http://localhost:8080/api/posts/trending?${params}`;
      } else if (userId) {
        return `http://localhost:8080/api/posts/user/${userId}?${params}`;
      } else if (tag) {
        return `http://localhost:8080/api/posts/tag/${tag}?${params}`;
      } else {
        return `http://localhost:8080/api/posts?${params}`;
      }
  }, [pageSize, sortBy, userId, tag]);

  const fetchPosts = useCallback(async (page: number, append: boolean = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl(page);
      console.log('useInfinitePosts: 게시글 조회 시작', { url, page, append });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `게시글 조회 실패: ${response.status}`);
      }

      const data: PostsResponse = await response.json();
      console.log('useInfinitePosts: 게시글 조회 성공', data);

      // 게시글 데이터에 좋아요/스크랩 상태 적용 (배치 상태가 있을 때만)
      const postsWithStatus = data.content.map(post => {
        // 배치 상태가 로드된 경우에만 적용, 없으면 백엔드 기본값 사용
        if (batchReactionStatus) {
          const status = reactionManager.getPostStatus(post.postId);
          
          return {
            ...post,
            isLiked: status?.liked ?? post.isLiked ?? false,
            isScrapped: status?.scraped ?? post.isScrapped ?? false,
            likeCount: status?.likeCount ?? post.likeCount,
            scrapCount: status?.scrapCount ?? post.scrapCount
          };
        } else {
          // 배치 상태가 아직 로드되지 않은 경우 백엔드 기본값 사용
          return {
            ...post,
            isLiked: post.isLiked ?? false,
            isScrapped: post.isScrapped ?? false
          };
        }
      });

      if (append) {
        setPosts(prev => [...prev, ...postsWithStatus]);
      } else {
        setPosts(postsWithStatus);
      }

      setHasMore(!data.last);
      setCurrentPage(page);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // 요청이 취소된 경우
      }
      
      const errorMessage = err instanceof Error ? err.message : '게시글 조회 중 오류가 발생했습니다';
      console.error('useInfinitePosts: 에러 발생', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [buildApiUrl]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchPosts(currentPage + 1, true);
  }, [loading, hasMore, currentPage, fetchPosts]);

  const refresh = useCallback(() => {
    setPosts([]);
    setCurrentPage(0);
    setHasMore(true);
    fetchPosts(0, false);
  }, [fetchPosts]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // 배치 상태가 업데이트될 때 게시글 상태 동기화
  useEffect(() => {
    if (batchReactionStatus && posts.length > 0) {
      setPosts(prevPosts => 
        prevPosts.map(post => {
          const status = reactionManager.getPostStatus(post.postId);
          
          if (status) {
            return {
              ...post,
              isLiked: status.liked ?? post.isLiked,
              isScrapped: status.scraped ?? post.isScrapped,
              likeCount: status.likeCount ?? post.likeCount,
              scrapCount: status.scrapCount ?? post.scrapCount
            };
          }
          return post;
        })
      );
    }
  }, [batchReactionStatus]);

  // 초기 로드
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 컴포넌트 언마운트 시 진행 중인 요청 취소
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    resetError,
  };
}
