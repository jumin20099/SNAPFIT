"use client"
import { useState, useEffect, useCallback, useRef } from 'react';
import { useBatchReactionStatus } from '@/shared/hooks/useBatchReactionStatus';
import type { ReactionStatusItem } from '@/shared/types';

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
  updatePostReaction: (postId: number, updates: Partial<ReactionStatusItem>, reactionStatus?: Record<string, Partial<ReactionStatusItem>>) => void;
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
  const lastReplacePageRef = useRef<number | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchedPagesRef = useRef<Set<number>>(new Set());
  const isFetchingRef = useRef(false);
  const reactionOverridesRef = useRef<Record<number, Partial<ReactionStatusItem>>>({});

  // 배치 상태 조회 훅
  const postIds = posts.map(p => p.postId)
  const { data: batchReactionStatus, manager: reactionManager } = useBatchReactionStatus({
    postIds,
    enabled: postIds.length > 0
  });

  const applyReactionState = useCallback((post: Post): Post => {
    const override = reactionOverridesRef.current[post.postId] || {};
    const status = reactionManager.getPostStatus(post.postId);

    const liked = override.liked ?? status?.liked ?? post.isLiked ?? false;
    const likeCount = override.likeCount ?? status?.likeCount ?? post.likeCount ?? 0;
    const scraped = override.scraped ?? status?.scraped ?? post.isScrapped ?? false;
    const scrapCount = override.scrapCount ?? status?.scrapCount ?? post.scrapCount ?? 0;

    return {
      ...post,
      isLiked: liked,
      likeCount,
      isScrapped: scraped,
      scrapCount
    };
  }, [reactionManager]);

  const mergeServerReactionStatus = useCallback((status?: Record<string, Partial<ReactionStatusItem>>) => {
    if (!status) return;
    if (process.env.NODE_ENV === 'development') {
      console.log('[community:reaction:hook] mergeServerReactionStatus', {
        statusKeys: Object.keys(status),
        overridesBefore: { ...reactionOverridesRef.current }
      });
    }
    reactionManager.mergeRawStatus(status);
    reactionOverridesRef.current = {};
    setPosts(prevPosts => prevPosts.map(applyReactionState));
  }, [reactionManager, applyReactionState]);

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

    if (replace && lastReplacePageRef.current !== null && page === lastReplacePageRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[community:reaction:hook] fetchPage:skip-replace', { page, currentOverrides: { ...reactionOverridesRef.current } });
      }
      return;
    }

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

      const normalized = data.content.map(post => ({
        ...post,
        isLiked: post.isLiked ?? false,
        isScrapped: post.isScrapped ?? false,
        likeCount: post.likeCount ?? 0,
        scrapCount: post.scrapCount ?? 0
      }));

      const patched = normalized.map(applyReactionState);
      if (process.env.NODE_ENV === 'development') {
        console.log('[community:reaction:hook] fetchPage:normalized', {
          page,
          replace,
          normalizedSample: normalized.slice(0, 3).map(p => ({ postId: p.postId, isLiked: p.isLiked, likeCount: p.likeCount })),
          overrides: { ...reactionOverridesRef.current }
        });
      }
      setPosts(prev => {
        const next = replace ? patched : [...prev, ...patched];
        if (process.env.NODE_ENV === 'development') {
          console.log('[community:reaction:hook] fetchPage:setPosts', {
            replace,
            length: next.length,
            sample: next.slice(0, 3).map(p => ({ postId: p.postId, isLiked: p.isLiked, likeCount: p.likeCount }))
          });
        }
        return next;
      });
      setHasMore(!data.last);
      setCurrentPage(page);
      fetchedPagesRef.current.add(page);
      if (replace) {
        lastReplacePageRef.current = page;
      }
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
  }, [buildApiUrl, reactionManager, applyReactionState]);

  const loadMore = useCallback(() => {
    if (isFetchingRef.current || !hasMore) return;
    const nextPage = currentPage + 1;
    logReactionDebug('loadMore:trigger', { currentPage, nextPage, hasMore });
    void fetchPage(nextPage, false);
  }, [hasMore, currentPage, fetchPage]);

  const refresh = useCallback(async () => {
    fetchedPagesRef.current.clear();
    lastReplacePageRef.current = null;
    reactionOverridesRef.current = {};
    setHasMore(true);
    setCurrentPage(0);
    await fetchPage(0, true);
  }, [fetchPage]);

  const updatePostReaction = useCallback((postId: number, updates: Partial<ReactionStatusItem>, reactionStatus?: Record<string, Partial<ReactionStatusItem>>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[community:reaction:hook] updatePostReaction:input', { postId, updates, reactionStatus });
    }
    reactionOverridesRef.current[postId] = {
      ...reactionOverridesRef.current[postId],
      ...updates
    };
    reactionManager.updatePost(postId, updates);
    if (reactionStatus) {
      mergeServerReactionStatus(reactionStatus);
    } else {
      setPosts(prevPosts => prevPosts.map(applyReactionState));
    }
  }, [reactionManager, applyReactionState, mergeServerReactionStatus]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!batchReactionStatus || posts.length === 0) {
      return;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('[community:reaction:hook] batchReactionStatus:update', {
        keys: Object.keys(batchReactionStatus),
        overridesBefore: { ...reactionOverridesRef.current }
      });
    }
    reactionOverridesRef.current = {};
    setPosts(prevPosts => prevPosts.map(applyReactionState));
    lastReplacePageRef.current = null;
  }, [batchReactionStatus, applyReactionState, posts.length]);

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
    updatePostReaction,
  };
}
