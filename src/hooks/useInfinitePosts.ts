"use client"
import { useState, useEffect, useCallback, useRef } from 'react';
import { useBatchReactionStatus } from '@/shared/hooks/useBatchReactionStatus';
import type { ReactionStatusItem, Post as SharedPost } from '@/shared/types';
import type { BatchReactionStatusManager } from '@/shared/utils/batch-reaction-utils';
import ApiClient from '@/shared/utils/api-client';

// Post 타입은 src/shared/types/index.ts에서 import

interface PostsResponse {
  content: SharedPost[];
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
  boardType?: 'outfits' | 'questions' | 'info';
}

interface UseInfinitePostsReturn {
  posts: SharedPost[];
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
  const { pageSize = 10, sortBy = 'latest', userId, tag, boardType = 'outfits' } = options;
  const apiClient = ApiClient.getInstance();

  const logReactionDebug = (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.log('[community:reaction:hook]', ...args);
  };

  const [posts, setPosts] = useState<SharedPost[]>([]);
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
  const postIds = posts.map(p => p.postId).filter((id): id is number => id !== undefined)
  const { data: batchReactionStatus, manager: reactionManager } = useBatchReactionStatus({
    postIds,
    enabled: postIds.length > 0
  });

  const applyReactionState = useCallback((post: SharedPost): SharedPost => {
    const override = reactionOverridesRef.current[post.postId || 0] || {};
    const status = reactionManager.getPostStatus(post.postId || 0);

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

    const normalizedBoardType = boardType ?? 'outfits';
    // 프론트엔드 boardType을 백엔드 enum 값으로 변환
    const backendBoardType = normalizedBoardType === 'outfits' ? 'OUTFIT' : 
                            normalizedBoardType === 'questions' ? 'QUESTION' : 
                            normalizedBoardType === 'info' ? 'INFO' : 'OUTFIT';
    
    console.log('[useInfinitePosts] buildApiUrl:', {
      boardType,
      normalizedBoardType,
      backendBoardType,
      page
    });
    
    return `/api/posts/board/${backendBoardType}?${params}`;
  }, [pageSize, sortBy, userId, tag, boardType]);

  const fetchPage = useCallback(async (page: number, replace: boolean) => {
    console.log(`[community:reaction:hook] fetchPage:start`, { 
      page, 
      replace, 
      isFetching: isFetchingRef.current,
      hasMore,
      currentPage,
      postsLength: posts.length,
      fetchedPages: Array.from(fetchedPagesRef.current),
      lastReplacePage: lastReplacePageRef.current
    });

    if (isFetchingRef.current) {
      console.log(`[community:reaction:hook] fetchPage:blocked`, { page, replace, reason: 'already fetching' });
      return;
    }
    if (!replace && fetchedPagesRef.current.has(page)) {
      console.log(`[community:reaction:hook] fetchPage:blocked`, { page, replace, reason: 'page already fetched' });
      return;
    }

    if (replace && lastReplacePageRef.current !== null && page === lastReplacePageRef.current) {
      console.log('[community:reaction:hook] fetchPage:skip-replace', { page, currentOverrides: { ...reactionOverridesRef.current } });
      return;
    }

    // 이전 요청 취소하지 않음 (요청 중단 방지)
    // if (abortControllerRef.current && !replace) {
    //   console.log(`[community:reaction:hook] fetchPage:abort-previous`, { page, replace });
    //   abortControllerRef.current.abort();
    // }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl(page);

      console.log(`[community:reaction:hook] fetchPage:request`, { 
        url, 
        page, 
        replace, 
        signal: controller.signal.aborted ? 'aborted' : 'active'
      });

      const data = await apiClient.get<PostsResponse>(url);

      console.log(`[community:reaction:hook] fetchPage:response`, { 
        url, 
        page, 
        contentLength: data.content?.length || 0,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        number: data.number,
        first: data.first,
        last: data.last
      });

      const normalized = data.content.map(post => ({
        ...post,
        isLiked: post.isLiked ?? false,
        isScrapped: post.isScrapped ?? false,
        likeCount: post.likeCount ?? 0,
        scrapCount: post.scrapCount ?? 0
      }));

      const patched = normalized.map(applyReactionState);
      console.log('[community:reaction:hook] fetchPage:normalized', {
        page,
        replace,
        normalizedSample: normalized.slice(0, 3).map(p => ({ postId: p.postId, isLiked: p.isLiked, likeCount: p.likeCount })),
        overrides: { ...reactionOverridesRef.current }
      });
      
      setPosts(prev => {
        const next = replace ? patched : [...prev, ...patched];
        console.log('[community:reaction:hook] fetchPage:setPosts', {
          replace,
          prevLength: prev.length,
          nextLength: next.length,
          added: patched.length,
          sample: next.slice(0, 3).map(p => ({ postId: p.postId, isLiked: p.isLiked, likeCount: p.likeCount }))
        });
        return next;
      });
      
      setHasMore(!data.last);
      setCurrentPage(page);
      fetchedPagesRef.current.add(page);
      if (replace) {
        lastReplacePageRef.current = page;
      }
      
      console.log(`[community:reaction:hook] fetchPage:success`, { 
        page, 
        replace, 
        hasMore: !data.last,
        currentPage: page,
        fetchedPages: Array.from(fetchedPagesRef.current)
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log(`[community:reaction:hook] fetchPage:aborted`, { page, reason: 'AbortError' });
        return;
      }
      console.error(`[community:reaction:hook] fetchPage:error`, { 
        page, 
        error: err,
        errorName: err instanceof Error ? err.name : 'Unknown',
        errorMessage: err instanceof Error ? err.message : 'Unknown error'
      });
      const errorMessage = err instanceof Error ? err.message : '게시글 조회 중 오류가 발생했습니다';
      setError(errorMessage);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      console.log(`[community:reaction:hook] fetchPage:finally`, { page, replace, loading: false, isFetching: false });
    }
  }, [buildApiUrl, reactionManager, applyReactionState, apiClient]);

  const loadMore = useCallback(() => {
    console.log(`[community:reaction:hook] loadMore:start`, { 
      isFetching: isFetchingRef.current,
      hasMore,
      currentPage,
      postsLength: posts.length
    });
    
    if (isFetchingRef.current || !hasMore) {
      console.log(`[community:reaction:hook] loadMore:blocked`, { 
        isFetching: isFetchingRef.current,
        hasMore,
        reason: isFetchingRef.current ? 'already fetching' : 'no more posts'
      });
      return;
    }
    
    const nextPage = currentPage + 1;
    console.log(`[community:reaction:hook] loadMore:trigger`, { currentPage, nextPage, hasMore });
    void fetchPage(nextPage, false);
  }, [hasMore, currentPage, fetchPage]);

  const refresh = useCallback(async () => {
    console.log(`[community:reaction:hook] refresh:start`, { 
      currentPosts: posts.length,
      currentPage,
      hasMore,
      fetchedPages: Array.from(fetchedPagesRef.current),
      lastReplacePage: lastReplacePageRef.current
    });
    
    fetchedPagesRef.current.clear();
    lastReplacePageRef.current = null;
    reactionOverridesRef.current = {};
    setHasMore(true);
    setCurrentPage(0);
    
    console.log(`[community:reaction:hook] refresh:cleared`, { 
      fetchedPages: Array.from(fetchedPagesRef.current),
      lastReplacePage: lastReplacePageRef.current
    });
    
    await fetchPage(0, true);
    
    console.log(`[community:reaction:hook] refresh:completed`);
  }, [fetchPage, posts.length, currentPage, hasMore]);

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
    console.log(`[community:reaction:hook] useEffect:refresh`, { 
      sortBy, 
      userId, 
      tag, 
      boardType,
      currentPosts: posts.length,
      currentPage,
      hasMore
    });
    refresh();
  }, [sortBy, userId, tag, boardType]); // refresh 제거로 중복 실행 방지

  const mountCountRef = useRef(0);

  useEffect(() => {
    mountCountRef.current += 1;

    return () => {
      mountCountRef.current -= 1;

      if (mountCountRef.current === 0) {
        const controller = abortControllerRef.current;

        if (controller) {
          queueMicrotask(() => {
            if (mountCountRef.current === 0 && controller === abortControllerRef.current) {
              controller.abort();
              abortControllerRef.current = null;
            }
          });
        }
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
    reactionManager,
    updatePostReaction,
  };
}
