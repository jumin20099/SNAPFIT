'use client'

import { useState, useEffect } from 'react'
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
}

export default function CommunityPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [activeTab, setActiveTab] = useState('snap')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)

  // 게시글 데이터 로드
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 토큰 가져오기
        const token = localStorage.getItem('token')
        
        const response = await fetch('/api/posts', {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        })
        if (response.ok) {
          const data = await response.json()
          // 데이터가 배열인지 확인하고 안전하게 설정
          const postsArray = Array.isArray(data) ? data : (data.content || [])
          
          // localStorage에서 조회수 가져오기
          const viewCounts = JSON.parse(localStorage.getItem('postViewCounts') || '{}')
          
          // 조회수 복원 및 필드명 통일
          const postsWithViewCount = postsArray.map((post: any) => {
            console.log(`게시글 ${post.postId} 상태:`, {
              isLiked: post.isLiked,
              isScrapped: post.isScrapped,
              likeCount: post.likeCount,
              scrapCount: post.scrapCount
            });
            
            return {
              ...post,
              viewCount: viewCounts[post.postId] || post.viewCount || 0,
              // 백엔드 응답 필드명을 프론트엔드 기대 형식으로 변환
              liked: post.isLiked || false,
              scraped: post.isScrapped || false,
              authorId: post.authorId || post.userId || null
            };
          })
          
          setPosts(postsWithViewCount)
          setFilteredPosts(postsWithViewCount)
          
          // 배치 상태 조회로 정확한 상태 업데이트
          console.log('배치 상태 조회 조건 확인:', { 
            hasToken: !!token, 
            postsLength: postsWithViewCount.length,
            token: token ? token.substring(0, 10) + '...' : 'null'
          })
          
          // 임시: 토큰이 없어도 배치 상태 조회 실행 (디버깅용)
          if (postsWithViewCount.length > 0) {
            try {
              const postIds = postsWithViewCount.map((post: any) => post.postId)
              console.log('배치 상태 조회 요청:', { postIds, token: token ? token.substring(0, 10) + '...' : 'null' })
              
              const statusResponse = await fetch('/api/reactions/status', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ postIds })
              })
              
              console.log('배치 상태 조회 응답:', statusResponse.status, statusResponse.statusText)
              
              if (statusResponse.ok) {
                const statusData = await statusResponse.json()
                console.log('배치 상태 조회 결과:', statusData)
                
                // 상태 업데이트
                const updatedPosts = postsWithViewCount.map((post: any) => {
                  const status = statusData[`post_${post.postId}`]
                  if (status) {
                    return {
                      ...post,
                      liked: status.liked,
                      scraped: status.scraped,
                      likeCount: status.likeCount,
                      scrapCount: status.scrapCount
                    }
                  }
                  return post
                })
                
                setPosts(updatedPosts)
                setFilteredPosts(updatedPosts)
              }
            } catch (statusError) {
              console.error('배치 상태 조회 실패, 기본 상태 사용:', statusError)
            }
          }
      } else {
          throw new Error(`게시글 로드 실패: ${response.status}`)
      }
    } catch (error) {
        console.error('게시글 로드 실패:', error)
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
        setPosts([])
        setFilteredPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [])

  // 검색 및 필터링
  useEffect(() => {
    if (!Array.isArray(posts)) {
      setFilteredPosts([])
        return
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

    setFilteredPosts(filtered)
  }, [posts, searchTerm, sortBy, activeTab])


  // 좋아요 토글은 이제 LikeButton 컴포넌트에서 처리

  // 게시글 클릭 시 상세 페이지로 이동
  const handlePostClick = (postId: number) => {
    router.push(`/community/${postId}`)
  }

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
              <div className="grid grid-cols-2 gap-2">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.postId}
                    post={post}
                    onLike={() => {}} // 더 이상 필요하지 않음
                    onClick={() => handlePostClick(post.postId)}
                  />
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

function PostCard({ post, onLike, onClick }: PostCardProps) {
  const router = useRouter()
  
  return (
    <div 
      className="relative cursor-pointer group"
      onClick={onClick}
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
          targetType="outfit"
          initialActive={post.liked}
          initialCount={0}
          showCount={false}
          className="p-1 transition-all duration-200 hover:scale-110"
        />
      </div>

      {/* 게시글 정보 - 좋아요 버튼만 유지 */}
    </div>
  )
}
