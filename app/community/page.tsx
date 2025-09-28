'use client'

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Bell, Search, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationModal } from '@/components/ui/NotificationModal'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LikeButton } from '@/features/reactions/LikeButton'
import { useInfinitePosts } from '@/hooks/useInfinitePosts'

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
  // useInfinitePosts에서 사용하는 필드들
  isLiked?: boolean
  isScrapped?: boolean
}

const logScrollDebug = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'development') return
  console.log('[community:scroll]', ...args)
}

export default function CommunityPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [activeTab, setActiveTab] = useState('snap')
  const [showSearch, setShowSearch] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  
  // 무한 스크롤 훅 사용
  const { 
    posts, 
    loading: isLoading, 
    error, 
    hasMore, 
    loadMore 
  } = useInfinitePosts({
    pageSize: 20,
    sortBy: sortBy as 'latest' | 'trending' | 'popular'
  })
  
  // 추가 로딩 상태 (초기 로딩과 구분)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // filteredPosts는 useMemo로 계산되므로 상태로 관리하지 않음
  const observer = useRef<IntersectionObserver | null>(null)
  // 스크롤 복원 로직 제거 - 자연스러운 추가만 유지
  const listContainerRef = useRef<HTMLDivElement | null>(null)
  
  // 추가 게시글 로드 함수 - 자연스러운 추가
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    
    logScrollDebug('loadMore:start', {
      currentScrollY: window.scrollY,
      postsLength: posts.length
    })
    
    setIsLoadingMore(true)
    try {
      await loadMore()
      logScrollDebug('loadMore:completed')
    } catch (error) {
      logScrollDebug('loadMore:error', error)
    } finally {
      setIsLoadingMore(false)
      logScrollDebug('loadMore:finally', {
        hasMore,
        postsLength: posts.length
      })
    }
  }, [isLoadingMore, hasMore, loadMore, posts.length])

  // 무한 스크롤을 위한 마지막 요소 관찰 - 최적화
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return
    
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        logScrollDebug('intersection:trigger', { hasMore, isLoadingMore })
        handleLoadMore()
      }
    }, {
      rootMargin: '200px', // 200px 전에 미리 로드로 자연스러운 로딩
      threshold: 0.1
    })
    
    if (node) observer.current.observe(node)
  }, [isLoadingMore, hasMore, handleLoadMore])

  // 초기 로드 완료 감지
  useEffect(() => {
    if (posts.length > 0 && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [posts.length, isInitialLoad])

  // 스크롤 복원 로직 제거 - 자연스러운 추가만 유지

  // 검색 및 필터링 - useMemo로 최적화
  const filteredPosts = useMemo(() => {
    if (!Array.isArray(posts)) {
      return []
    }

    let filtered = [...posts]

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 탭별 필터링
    if (activeTab === 'following') {
      // 팔로잉 게시글만 표시 (실제 구현 필요)
      filtered = filtered.filter(post => post.authorName === '김주민') // 임시
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'popular':
          return b.likeCount - a.likeCount
        case 'mostCommented':
          return b.commentCount - a.commentCount
        default:
          return 0
      }
    })

    return filtered
  }, [posts, searchTerm, sortBy, activeTab])


  // 좋아요 토글은 이제 LikeButton 컴포넌트에서 처리

  // 게시글 클릭 시 상세 페이지로 이동 - 메모이제이션
  const handlePostClick = useCallback((postId: number) => {
    router.push(`/community/${postId}`)
  }, [router])

  // 좋아요 핸들러 - 빈 함수로 메모이제이션
  const handleLike = useCallback(() => {
    // LikeButton 컴포넌트에서 처리
  }, [])

  // 프로필 버튼 클릭 핸들러
  const handleProfileClick = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('로그인 후 사용 가능합니다.')
      return
    }
    
    // 토큰이 있으면 사용자 정보를 가져와서 프로필 페이지로 이동
    fetchUserProfile()
  }

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        const userId = userData.userIdx || userData.id
        if (userId) {
          router.push(`/profile/${userId}`)
        } else {
          alert('사용자 정보를 가져올 수 없습니다.')
        }
      } else {
        alert('로그인 후 사용 가능합니다.')
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error)
      alert('로그인 후 사용 가능합니다.')
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* 헤더 */}
      <div className="bg-white dark:bg-dark-sub border-b border-gray-200 dark:border-dark-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* SNAP 로고 */}
            <div className="font-bold text-2xl text-light-accent dark:text-dark-accent">SNAP</div>
            
            {/* 우측 아이콘들 */}
            <div className="flex items-center gap-4">
              {/* 글 작성 버튼 */}
              <Button
                onClick={() => router.push('/community/create')}
                className="bg-light-accent dark:bg-dark-accent hover:bg-light-accent/90 dark:hover:bg-dark-accent/90 text-white px-4 py-2 rounded-lg font-medium"
              >
                글 작성
              </Button>
              
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-dark-text" />
              </button>
              <button 
                onClick={() => setIsNotificationModalOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-dark-text" />
                {/* 알림 배지 */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <button 
                onClick={handleProfileClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
              >
                <User className="w-5 h-5 text-gray-600 dark:text-dark-text" />
              </button>
            </div>
      </div>

          {/* 검색바 */}
          {showSearch && (
            <div className="mt-4">
          <Input
            placeholder="패션 정보를 검색해보세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      )}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-3 bg-transparent h-12 p-0 border-b border-gray-200">
              <TabsTrigger
              value="snap" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full text-base font-medium"
              >
              스냅
              </TabsTrigger>
              <TabsTrigger
                value="ranking"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full text-base font-medium"
              >
                랭킹
              </TabsTrigger>
              <TabsTrigger
                value="following"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full text-base font-medium"
              >
                팔로잉
              </TabsTrigger>
            </TabsList>

          {/* 탭별 컨텐츠 */}
          <TabsContent value="snap" className="m-0">
            {/* 게시글 개수 */}
            <div className="mb-4">
              <span className="text-gray-600">{filteredPosts.length.toLocaleString()}개</span>
          </div>

            {/* 필터 바 */}
            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
              <FilterDropdown label="모든" />
              <FilterDropdown label="남" />
              <FilterDropdown label="여" />
              <FilterDropdown label="유형" />
              <FilterDropdown label="계절" />
              <FilterDropdown label="스타일" />
              <FilterDropdown label="키/몸무게" />
              <FilterDropdown label="TPO" />
              <FilterDropdown label="카테고리" />
              <FilterDropdown label="브랜드" />
              
              {/* 정렬 옵션 */}
              <div className="ml-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">인기순</SelectItem>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="mostCommented">댓글순</SelectItem>
                  </SelectContent>
                </Select>
                </div>
            </div>

            {/* 게시글 그리드 */}
            {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
              <div
                ref={listContainerRef}
                className="grid grid-cols-2 gap-2"
                style={{
                  transition: 'none', // 애니메이션 제거로 깜빡임 방지
                  willChange: 'auto'
                }}
              >
                {filteredPosts.map((post, index) => (
                  <div
                    key={post.postId}
                    ref={index === filteredPosts.length - 1 ? lastPostElementRef : null}
                  >
                    <PostCard
                      post={{
                        ...post,
                        liked: post.isLiked ?? false,
                        scraped: post.isScrapped ?? false
                      }}
                      onLike={handleLike}
                      onClick={() => handlePostClick(post.postId)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm ? '검색 결과가 없습니다' : '표시할 게시글이 없습니다'}
                </p>
                {searchTerm && (
                  <p className="text-gray-400 text-sm">
                    다른 검색어를 시도해보세요
                  </p>
                )}
              </div>
            )}
            
            {/* 추가 로딩 인디케이터 - 하단 고정 */}
            {isLoadingMore && (
              <div className="flex justify-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg mt-4">
                <div className="text-gray-500 text-sm flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  게시글을 불러오는 중...
                </div>
              </div>
            )}
            
            {/* 더 이상 로드할 게시글이 없을 때 */}
            {!hasMore && filteredPosts.length > 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                모든 게시글을 불러왔습니다
              </div>
            )}
            </TabsContent>

            <TabsContent value="ranking" className="m-0">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">랭킹 시스템</h3>
              <p className="text-gray-600 mb-4">인기 게시글과 사용자 랭킹을 확인해보세요</p>
              <div className="text-sm text-gray-500">
                <p>• 일일 인기 게시글</p>
                <p>• 주간 인기 게시글</p>
                <p>• 인기 사용자</p>
              </div>
              </div>
            </TabsContent>

            <TabsContent value="following" className="m-0">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">팔로잉</h3>
              <p className="text-gray-600 mb-4">팔로우한 사용자들의 최신 게시글을 확인해보세요</p>
              <div className="text-sm text-gray-500">
                <p>• 팔로우한 사용자 게시글</p>
                <p>• 실시간 업데이트</p>
              </div>
              </div>
            </TabsContent>
        </Tabs>
      </div>

      {/* 알림 모달 */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  )
}

// 필터 드롭다운 컴포넌트
function FilterDropdown({ label }: { label: string }) {
    return (
    <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap">
      <span>{label}</span>
      <ChevronDown className="w-4 h-4" />
    </button>
  )
}

// 간단한 게시글 카드 컴포넌트 (SNAP 스타일)
interface PostCardProps {
  post: Post
  onLike: () => void
  onClick: () => void
}

const PostCard = React.memo(({ post, onLike, onClick }: PostCardProps) => {
  const router = useRouter()
  
  return (
    <div 
      className="relative cursor-pointer group"
      onClick={onClick}
      style={{
        contain: 'layout style', // 레이아웃 격리로 리플로우 방지
        willChange: 'auto'
      }}
    >
      {/* 게시글 이미지 */}
      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
        {post.mediaUrls && post.mediaUrls.length > 0 ? (
          <img
            src={post.mediaUrls[0]}
            alt="게시글 이미지"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <span className="text-gray-500 text-sm">이미지 없음</span>
          </div>
        )}
      </div>
        
      {/* 우측 하단 좋아요 버튼만 */}
      <div 
        className="absolute top-2 right-2"
        onClick={(e) => e.stopPropagation()}
      >
        <LikeButton
          targetIdx={post.postId}
          targetType="post"
          initialActive={post.liked}
          initialCount={0}
          showCount={false}
          className="p-1 transition-all duration-200 hover:scale-110"
        />
      </div>

      {/* 게시글 정보 - 좋아요 버튼만 유지 */}
    </div>
  )
}, (prevProps, nextProps) => {
  // props 비교 로직으로 불필요한 리렌더링 방지
  return (
    prevProps.post.postId === nextProps.post.postId &&
    prevProps.post.liked === nextProps.post.liked &&
    prevProps.post.scraped === nextProps.post.scraped &&
    prevProps.post.mediaUrls?.[0] === nextProps.post.mediaUrls?.[0]
  )
})
