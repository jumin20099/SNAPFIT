"use client"
import { useState, useEffect, useCallback, useRef } from 'react';

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

      if (append) {
        setPosts(prev => [...prev, ...data.content]);
      } else {
        setPosts(data.content);
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
