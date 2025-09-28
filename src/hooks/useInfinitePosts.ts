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
  reactionManager: BatchReactionStatusManager;
}

export function useInfinitePosts(options: UseInfinitePostsOptions = {}): UseInfinitePostsReturn {
  const { pageSize = 10, sortBy = 'latest', userId, tag } = options;

  const logReactionDebug = (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.log('[community:reaction:hook]', ...args);
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchedPagesRef = useRef<Set<number>>(new Set());
  const isFetchingRef = useRef(false);

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
      return `/api/posts/trending?${params}`;
    } else if (userId) {
      return `/api/posts/user/${userId}?${params}`;
    } else if (tag) {
      return `/api/posts/tag/${tag}?${params}`;
    }
    return `/api/posts?${params}`;
  }, [pageSize, sortBy, userId, tag]);

  const fetchPage = useCallback(async (page: number, replace: boolean) => {
    if (isFetchingRef.current) return;
    if (!replace && fetchedPagesRef.current.has(page)) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl(page);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `게시글 조회 실패: ${response.status}`);
      }

      const data: PostsResponse = await response.json();

      const postsWithStatus = data.content.map(post => {
        const status = reactionManager.getPostStatus(post.postId);
        const patched = {
          ...post,
          isLiked: status?.liked ?? post.isLiked ?? false,
          isScrapped: status?.scraped ?? post.isScrapped ?? false,
          likeCount: status?.likeCount ?? post.likeCount ?? 0,
          scrapCount: status?.scrapCount ?? post.scrapCount ?? 0
        };
        logReactionDebug('fetchPage:patched', {
          postId: post.postId,
          originalLiked: post.isLiked,
          patchedLiked: patched.isLiked,
          managerLiked: status?.liked,
          originalLikeCount: post.likeCount,
          patchedLikeCount: patched.likeCount,
          managerLikeCount: status?.likeCount
        });
        return patched;
      });

      setPosts(prev => {
        const next = replace ? postsWithStatus : [...prev, ...postsWithStatus];
        logReactionDebug('fetchPage:setPosts', {
          replace,
          length: next.length,
          sample: next.slice(0, 3).map(p => ({ postId: p.postId, isLiked: p.isLiked, likeCount: p.likeCount }))
        });
        return next;
      });
      setHasMore(!data.last);
      setCurrentPage(page);
      fetchedPagesRef.current.add(page);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : '게시글 조회 중 오류가 발생했습니다';
      setError(errorMessage);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [buildApiUrl, reactionManager]);

  const loadMore = useCallback(() => {
    if (isFetchingRef.current || !hasMore) return;
    const nextPage = currentPage + 1;
    logReactionDebug('loadMore:trigger', { currentPage, nextPage, hasMore });
    void fetchPage(nextPage, false);
  }, [hasMore, currentPage, fetchPage]);

  const refresh = useCallback(async () => {
    fetchedPagesRef.current.clear();
    setHasMore(true);
    setCurrentPage(0);
    await fetchPage(0, true);
  }, [fetchPage]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (batchReactionStatus && posts.length > 0) {
      logReactionDebug('batchStatus:update', {
        size: posts.length,
        sample: posts.slice(0, 3).map(p => ({ postId: p.postId, beforeLiked: p.isLiked }))
      });
      setPosts(prevPosts =>
        prevPosts.map(post => {
          const status = reactionManager.getPostStatus(post.postId);
          if (!status) return post;
          const patched = {
            ...post,
            isLiked: status.liked ?? post.isLiked,
            isScrapped: status.scraped ?? post.isScrapped,
            likeCount: status.likeCount ?? post.likeCount,
            scrapCount: status.scrapCount ?? post.scrapCount
          };
          logReactionDebug('batchStatus:patched', {
            postId: post.postId,
            beforeLiked: post.isLiked,
            afterLiked: patched.isLiked,
            statusLiked: status.liked,
            beforeLikeCount: post.likeCount,
            afterLikeCount: patched.likeCount,
            statusLikeCount: status.likeCount
          });
          return patched;
        })
      );
    }
  }, [batchReactionStatus, reactionManager, posts.length]);

  useEffect(() => {
    refresh();
  }, [sortBy, userId, tag, refresh]);

  useEffect(() => () => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    resetError,
    reactionManager,
  };
}
