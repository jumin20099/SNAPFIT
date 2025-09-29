'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useInfinitePosts } from '@/hooks/useInfinitePosts'
import dynamic from 'next/dynamic'
const DynamicLikeButton = dynamic(async () => {
  const mod = await import('@/features/reactions/LikeButton')
  return mod.LikeButton
}, {
  ssr: false,
  loading: () => null
})

type SortOption = 'latest' | 'popular' | 'trending' | 'mostCommented'

interface CommunityFeedProps {
  sortBy: SortOption
  searchTerm: string
  activeTab: string
  onPostClick?: (postId: number) => void
  onTotalCountChange?: (count: number) => void
}

interface Post {
  postId: number
  content: string
  authorName: string
  authorId?: string
  authorProfileImage?: string
  createdAt: string
  likeCount: number
  commentCount: number
  scrapCount: number
  viewCount: number
  liked: boolean
  scraped: boolean
  mediaUrls?: string[]
  tags?: string[]
  outfitId?: number
  authorHeightCm?: number | null
  authorWeightKg?: number | string | null
  codyData?: {
    name: string
    items: Array<{
      productId: number
      src: string
      nx: number
      ny: number
      rotation: number
      z: number
      scale: number
    }>
    background: {
      type: string
      selectedBackground: string
      customColor: string
    }
    timestamp: number
  }
  isLiked?: boolean
  isScrapped?: boolean
}

const logScrollDebug = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'development') return
  console.log('[community:scroll]', ...args)
}

const logReactionDebug = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'development') return
  console.log('[community:reaction]', ...args)
}

import type { ReactionStatusItem } from '@/shared/types'

const CommunityFeed: React.FC<CommunityFeedProps> = ({ sortBy, searchTerm, activeTab, onPostClick, onTotalCountChange }) => {
  const router = useRouter()

  const normalizedSort = sortBy === 'latest' || sortBy === 'trending' ? sortBy : 'popular'

  const { posts, loading, error, hasMore, loadMore, reactionManager, updatePostReaction } = useInfinitePosts({
    pageSize: 20,
    sortBy: normalizedSort,
  })

  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const topAnchorRef = useRef<HTMLElement | null>(null)
  const topAnchorTopRef = useRef<number>(0)

  const captureTopAnchor = useCallback(() => {
    const anchor = document.elementFromPoint(0, 0)?.closest('[data-post-id]') as HTMLElement | null
    if (!anchor) {
      topAnchorRef.current = null
      return
    }
    topAnchorRef.current = anchor
    topAnchorTopRef.current = anchor.getBoundingClientRect().top
  }, [])

  const applyAnchorDelta = useCallback(() => {
    const anchor = topAnchorRef.current
    if (!anchor) return
    const newTop = anchor.getBoundingClientRect().top
    const delta = newTop - topAnchorTopRef.current
    if (delta !== 0) {
      window.scrollBy(0, delta)
    }
  }, [])

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    captureTopAnchor()

    logScrollDebug('loadMore:start', {
      currentScrollY: window.scrollY,
      postsLength: posts.length,
    })

    setIsLoadingMore(true)
    try {
      await loadMore()
      requestAnimationFrame(() => requestAnimationFrame(applyAnchorDelta))
      logScrollDebug('loadMore:completed')
    } catch (err) {
      logScrollDebug('loadMore:error', err)
    } finally {
      setIsLoadingMore(false)
      logScrollDebug('loadMore:finally', {
        hasMore,
        postsLength: posts.length,
      })
    }
  }, [isLoadingMore, hasMore, loadMore, posts.length, captureTopAnchor, applyAnchorDelta])

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect()

      if (node) {
        observer.current = new IntersectionObserver(
          entries => {
            const entry = entries[0]
            if (entry?.isIntersecting && hasMore && !isLoadingMore) {
              logScrollDebug('intersection:trigger', { hasMore, isLoadingMore })
              handleLoadMore()
            }
          },
          {
            root: null,
            rootMargin: '300px',
            threshold: 0.05,
          }
        )

        observer.current.observe(node)
      }
    },
    [handleLoadMore, hasMore, isLoadingMore]
  )

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  const filteredPosts = useMemo(() => {
    if (!Array.isArray(posts)) return []

    let result = [...posts]

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(
        post =>
          post.content.toLowerCase().includes(lower) ||
          post.authorName.toLowerCase().includes(lower) ||
          post.tags?.some(tag => tag.toLowerCase().includes(lower))
      )
    }

    if (activeTab === 'following') {
      result = result.filter(post => post.authorName === '김주민')
    }

    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'mostCommented') {
      result.sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0))
    }
    // 인기/트렌딩 정렬은 백엔드 결과를 그대로 유지해 좋아요 토글 시 즉시 재정렬되지 않도록 함

    return result
  }, [posts, searchTerm, activeTab, sortBy])

  useEffect(() => {
    onTotalCountChange?.(filteredPosts.length)
  }, [filteredPosts.length, onTotalCountChange])

  const handleCardClick = useCallback(
    (postId: number) => {
      if (onPostClick) {
        onPostClick(postId)
        return
      }
      router.push(`/community/${postId}`)
    },
    [onPostClick, router]
  )

  const handleLikeSuccess = useCallback((postId: number, payload: { liked: boolean; count: number; reactionStatus?: Record<string, Partial<ReactionStatusItem>> }) => {
    const { liked, count, reactionStatus } = payload;
    logReactionDebug('handleLikeSuccess', { postId, liked, count, reactionStatus });
    updatePostReaction(postId, { liked, likeCount: count }, reactionStatus);
  }, [updatePostReaction]);

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[200px] bg-white flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-light-accent text-white"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {filteredPosts.map(post => {
            const status = reactionManager.getPostStatus(post.postId)
            const liked = status?.liked ?? post.isLiked ?? false
            const likeCount = status?.likeCount ?? post.likeCount ?? 0
            logReactionDebug('renderPost', {
              postId: post.postId,
              liked,
              likeCount,
              status,
              fallbackLiked: post.isLiked,
              fallbackLikeCount: post.likeCount,
              override: reactionManager.getPostStatus(post.postId) && reactionManager.getPostStatus(post.postId)?.liked !== undefined,
              reactionStatusRaw: status
            })
            return (
              <div data-post-id={post.postId} key={post.postId}>
                <PostCard
                  post={post}
                  liked={liked}
                  likeCount={likeCount}
                  onClick={() => handleCardClick(post.postId)}
                  onToggleSuccess={(payload) => handleLikeSuccess(post.postId, payload)}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <p className="text-gray-500 text-lg mb-2">
            {searchTerm ? '검색 결과가 없습니다' : '표시할 게시글이 없습니다'}
          </p>
          {searchTerm && <p className="text-gray-400 text-sm">다른 검색어를 시도해보세요</p>}
        </div>
      )}

      {isLoadingMore && (
        <div className="infinite-loader flex justify-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg mt-4">
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            게시글을 불러오는 중...
          </div>
        </div>
      )}

      {hasMore ? (
        <div className="infinite-sentinel" ref={sentinelRef} />
      ) : (
        filteredPosts.length > 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            모든 게시글을 불러왔습니다
          </div>
        )
      )}
    </>
  )
}

interface PostCardProps {
  post: Post
  liked: boolean
  likeCount: number
  onToggleSuccess: (payload: { liked: boolean; count: number; reactionStatus?: Record<string, Partial<ReactionStatusItem>> }) => void
  onClick: () => void
}

const PostCard = React.memo(({ post, liked, likeCount, onToggleSuccess, onClick }: PostCardProps) => {
  const handleSuccess = useCallback((data: { liked: boolean; count: number; reactionStatus?: Record<string, Partial<ReactionStatusItem>> }) => {
    logReactionDebug('toggleLike:success', {
      postId: post.postId,
      liked: data.liked,
      count: data.count,
      reactionStatus: data.reactionStatus
    });
    onToggleSuccess({
      liked: data.liked,
      count: data.count,
      reactionStatus: data.reactionStatus
    });
  }, [onToggleSuccess, post.postId]);

  const handleError = useCallback((error: Error) => {
    logReactionDebug('toggleLike:error', {
      postId: post.postId,
      message: error.message
    })
  }, [post.postId])

  return (
    <div className="relative cursor-pointer group" onClick={onClick}>
      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
        {post.mediaUrls && post.mediaUrls.length > 0 ? (
          <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
            <img
              src={post.mediaUrls[0]}
              alt="게시글 이미지"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <span className="text-gray-500 text-sm">이미지 없음</span>
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2" onClick={event => event.stopPropagation()}>
        <DynamicLikeButton
          targetIdx={post.postId}
          targetType="post"
          initialActive={liked}
          initialCount={likeCount}
          showCount={false}
          className="p-1 transition-all duration-200 hover:scale-110"
          onToggleSuccess={handleSuccess}
          onToggleError={handleError}
        />
      </div>
    </div>
  )
}, areEqualPostCard)

function areEqualPostCard(prevProps: PostCardProps, nextProps: PostCardProps) {
  return (
    prevProps.post.postId === nextProps.post.postId &&
    prevProps.liked === nextProps.liked &&
    prevProps.likeCount === nextProps.likeCount &&
    prevProps.post.mediaUrls?.[0] === nextProps.post.mediaUrls?.[0]
  )
}

export { CommunityFeed }

