"use client"

import { useState, useEffect } from "react"
import { Heart, Search, Bell, User, Filter, ChevronDown, Home, Users, Bookmark, TrendingUp, Calendar, Clock, MessageSquare, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTrendingRanking, useDailyRanking, useWeeklyRanking, RankingPost } from "@/hooks/useRanking"
import { useFollowingPosts } from "@/hooks/useFollowingPosts"
import { useSSENotifications } from "@/hooks/useSSENotifications"
import { useFollow } from "@/hooks/useFollow"
import { useComments } from "@/hooks/useComments"
import { useDeletePost } from "@/hooks/useDeletePost"
import { useBlock } from "@/hooks/useBlock"
import { useReport } from "@/hooks/useReport"
import { isCurrentUserPostAuthor } from "@/lib/auth-utils"
import PostCreatePage from "@/components/post-create-page"
import NotificationPage from "@/components/notification-page"
import * as jose from 'jose'

interface Post {
  postId: number
  title: string
  content: string
  authorName: string
  authorProfileImage: string
  mediaUrls: string[]
  likeCount: number
  commentCount: number
  scrapCount: number
  createdAt: string
  tags: string[]
  liked?: boolean
  scraped?: boolean
  type?: "fashion-tip" | "review" | "trend" | "styling" | "info"
}

const filterOptions = {
  type: ["전체", "패션팁", "리뷰", "트렌드", "스타일링", "정보"],
  sort: ["최신순", "좋아요순", "댓글순", "스크랩순"],
}

export default function CommunityPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: "전체",
    sort: "최신순",
  })
  const [isPostCreateOpen, setIsPostCreateOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  // 랭킹 시스템 훅
  const trendingRanking = useTrendingRanking(20)
  const dailyRanking = useDailyRanking(20)
  const weeklyRanking = useWeeklyRanking(20)
  
  // 팔로잉 게시글 훅
  const followingPosts = useFollowingPosts()

  // 실시간 알림 훅
  const { unreadCount, isConnected, error: notificationError, reconnect } = useSSENotifications()

  // JWT 토큰 생성 함수 (개발용)
  const generateTestToken = async () => {
    try {
      const payload = {
        sub: 'qazplm20099@gmail.com',
        role: 'ADMIN',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간 후 만료
      };
      
      // 백엔드의 JWT 시크릿 키와 일치하는 서명
      const secret = new TextEncoder().encode('SnapFitJWTSecretKey2024DevelopmentEnvironment');
      
      // jose 라이브러리로 JWT 토큰 생성
      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);
      
      console.log('생성된 JWT 토큰:', token);
      console.log('토큰 페이로드:', payload);
      
      return token;
    } catch (error) {
      console.error('JWT 토큰 생성 실패:', error);
      // 폴백: 간단한 테스트 토큰
      return 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTU3MDgzMzYsImV4cCI6MTc1NTcwODMzNn0.7pB7MdWDsQKVZK_IG-5vWuSS1LNZmu6JWM_WgBVNPRA';
    }
  };

  // 임시사용자 토큰 생성 함수
  const generateTempUserToken = async () => {
    try {
      const payload = {
        sub: 'temp@example.com',
        role: 'USER',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간 후 만료
      };
      
      // 백엔드의 JWT 시크릿 키와 일치하는 서명
      const secret = new TextEncoder().encode('SnapFitJWTSecretKey2024DevelopmentEnvironment');
      
      // jose 라이브러리로 JWT 토큰 생성
      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);
      
      console.log('생성된 임시사용자 JWT 토큰:', token);
      console.log('토큰 페이로드:', payload);
      
      return token;
    } catch (error) {
      console.error('임시사용자 JWT 토큰 생성 실패:', error);
      return null;
    }
  };

  // 테스트 토큰 설정
  const setTestToken = async () => {
    try {
      const token = await generateTestToken();
      localStorage.setItem('token', token);
      console.log('테스트 토큰 설정됨:', token);
      alert('테스트 토큰이 설정되었습니다. 페이지를 새로고침하세요.');
    } catch (error) {
      console.error('테스트 토큰 설정 실패:', error);
      alert('테스트 토큰 설정에 실패했습니다.');
    }
  };

  // 임시사용자 토큰 설정
  const setTempUserToken = async () => {
    try {
      const token = await generateTempUserToken();
      if (token) {
        localStorage.setItem('token', token);
        console.log('임시사용자 토큰 설정됨:', token);
        alert('임시사용자 토큰이 설정되었습니다. 페이지를 새로고침하세요.');
      } else {
        alert('임시사용자 토큰 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('임시사용자 토큰 설정 실패:', error);
      alert('임시사용자 토큰 설정에 실패했습니다.');
    }
  };

  // 게시글 목록 가져오기
  const fetchPosts = async () => {
    setLoading(true)
    try {
      // 백엔드 API URL (Spring Boot 기본 포트: 8080)
      const response = await fetch('http://localhost:8080/api/posts?size=50')
      if (response.ok) {
        const data = await response.json()
        const postsData = data.content || []
        
        // Post 타입에 맞게 데이터 변환
        const transformedPosts = postsData.map((post: any) => ({
          postId: post.postId,
          title: post.title || "",
          content: post.content,
          authorName: post.authorName || "익명",
          authorProfileImage: post.authorProfileImage || "/placeholder.svg",
          mediaUrls: post.mediaUrls || [],
          likeCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          scrapCount: post.scrapCount || 0,
          createdAt: post.createdAt,
          tags: post.tags || [],
          liked: post.isLiked || false,
          scraped: post.isScrapped || false,
          type: "fashion-tip" // 기본값 설정
        }))
        
        setPosts(transformedPosts)
        console.log('게시글 로드 성공:', transformedPosts)
      } else {
        console.error('게시글 로드 실패:', response.status, response.statusText)
        // 에러 응답 내용도 확인
        try {
          const errorData = await response.text()
          console.error('에러 응답 내용:', errorData)
        } catch (e) {
          console.error('에러 응답 읽기 실패:', e)
        }
      }
    } catch (error) {
      console.error('게시글 로드 중 오류:', error)
      // 네트워크 오류인 경우 사용자에게 알림
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('백엔드 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 게시글 로드
  useEffect(() => {
    fetchPosts()
  }, [])

  // 사용자별 좋아요 및 스크랩 상태 가져오기
  useEffect(() => {
    const fetchUserInteractions = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('토큰이 없습니다. 로그인이 필요합니다.')
        return
      }

      console.log('토큰 확인:', token.substring(0, 20) + '...')

      try {
        // 좋아요 상태 가져오기
        const likesResponse = await fetch('http://localhost:8080/api/likes/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (likesResponse.ok) {
          const likesData = await likesResponse.json()
          console.log('좋아요 API 응답:', likesData)
          
          const likedPostIds = new Set(
            likesData
              .filter((like: any) => like?.targetType === 'OUTFIT_SHARE')
              .map((like: any) => Number(like?.targetIdx))
          )
          
          console.log('파싱된 좋아요 게시글 ID:', Array.from(likedPostIds))
          
          setPosts(prev => prev.map(post => ({
            ...post,
            liked: likedPostIds.has(post.postId)
          })))
        } else {
          console.error('좋아요 API 오류:', likesResponse.status, likesResponse.statusText)
          if (likesResponse.status === 401) {
            console.error('인증 실패. 토큰을 확인해주세요.')
            // 토큰이 유효하지 않아도 삭제하지 않고 계속 진행
          }
        }

        // 스크랩 상태 가져오기
        const scrapsResponse = await fetch('http://localhost:8080/api/scraps/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (scrapsResponse.ok) {
          const scrapedPostIds = new Set(
            (await scrapsResponse.json()).map((postId: number) => Number(postId))
          )
          
          setPosts(prev => prev.map(post => ({
            ...post,
            scraped: scrapedPostIds.has(post.postId)
          })))
        } else {
          console.error('스크랩 API 오류:', scrapsResponse.status, scrapsResponse.statusText)
          if (scrapsResponse.status === 401) {
            console.error('인증 실패. 토큰을 확인해주세요.')
            // 토큰이 유효하지 않아도 삭제하지 않고 계속 진행
          }
        }
      } catch (error) {
        console.error('사용자 상호작용 상태 가져오기 실패:', error)
      }
    }

    if (posts.length > 0) {
      fetchUserInteractions()
    }
  }, [posts.length])

  const toggleLike = async (postId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      console.log('좋아요 토글 시도:', postId, '토큰:', token.substring(0, 20) + '...');

      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetIdx: postId,  // postId를 targetIdx로 변경
          targetType: 'POST'  // targetType 추가
        })
      });

      console.log('좋아요 토글 응답 상태:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('좋아요 토글 성공:', result);
        
        // 게시글 상태 업데이트
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.postId === postId 
              ? { ...post, liked: result.liked, likeCount: result.count }
              : post
          )
        );
        
        console.log('좋아요 상태 업데이트 완료:', { postId, liked: result.liked, count: result.count });
      } else {
        console.error('좋아요 토글 실패:', response.status, response.statusText);
        alert('좋아요 토글에 실패했습니다.');
      }
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
      alert('좋아요 토글 중 오류가 발생했습니다.');
    }
  };

  const toggleScrap = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다')
        return
      }

      console.log('스크랩 토글 시도:', postId, '토큰:', token.substring(0, 20) + '...')

      const response = await fetch('/api/scraps/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId: postId
        })
      })

      console.log('스크랩 토글 응답 상태:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('스크랩 토글 성공:', data)
        
        // 응답 데이터 검증
        if (data.scraped !== undefined && data.count !== undefined) {
          setPosts(prevPosts => 
            prevPosts.map((post) =>
              post.postId === postId
                ? { ...post, scrapCount: data.count, scraped: data.scraped }
                : post,
            )
          )
          console.log('스크랩 상태 업데이트 완료:', { postId, scraped: data.scraped, count: data.count })
        } else {
          console.error('스크랩 응답 데이터 형식 오류:', data)
          alert('스크랩 응답 데이터 형식이 올바르지 않습니다.')
        }
      } else {
        const errorText = await response.text()
        console.error('스크랩 토글 실패:', response.status, response.statusText, errorText)
        
        if (response.status === 401) {
          console.error('인증 실패. 토큰을 확인해주세요.')
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        } else {
          alert(`스크랩 토글에 실패했습니다. (${response.status}: ${response.statusText})`)
        }
      }
    } catch (error) {
      console.error('스크랩 토글 중 오류:', error)
      alert('스크랩 토글 중 오류가 발생했습니다.')
    }
  }

  const getFilteredAndSortedPosts = () => {
    let filteredPosts = [...posts]
    
    // 타입 필터링
    if (filters.type !== "전체") {
      const typeMap: { [key: string]: string } = {
        "패션팁": "fashion-tip",
        "리뷰": "review", 
        "트렌드": "trend",
        "스타일링": "styling",
        "정보": "info"
      }
      filteredPosts = filteredPosts.filter(post => post.type === typeMap[filters.type])
    }

    // 검색어 필터링
    if (searchQuery) {
      filteredPosts = filteredPosts.filter(post => 
        post.title.includes(searchQuery) || 
        post.content.includes(searchQuery) ||
        post.tags.some(tag => tag.includes(searchQuery))
      )
    }

    // 정렬
    switch (filters.sort) {
      case "좋아요순":
        return filteredPosts.sort((a, b) => b.likeCount - a.likeCount)
      case "댓글순":
        return filteredPosts.sort((a, b) => b.commentCount - a.commentCount)
      case "스크랩순":
        return filteredPosts.sort((a, b) => b.scrapCount - a.scrapCount)
      case "최신순":
      default:
        return filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "오늘"
    if (diffDays === 2) return "어제"
    if (diffDays <= 7) return `${diffDays - 1}일 전`
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const handlePostClick = (postId: number) => {
    router.push(`/community/${postId}`)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }))
  }

  const handlePostCreateClose = () => {
    setIsPostCreateOpen(false)
    // 게시글 작성 완료 후 목록 새로고침
    fetchPosts()
  }

  // 토큰 디버깅 함수
  const debugToken = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('토큰이 없습니다')
      return
    }
    
    console.log('=== 토큰 디버깅 정보 ===')
    console.log('토큰 길이:', token.length)
    console.log('토큰 시작 부분:', token.substring(0, 50) + '...')
    console.log('토큰 끝 부분:', '...' + token.substring(token.length - 50))
    
    try {
      // JWT 토큰을 디코딩 (페이로드 부분만)
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        console.log('토큰 페이로드:', payload)
        console.log('토큰 만료 시간:', new Date(payload.exp * 1000))
        console.log('현재 시간:', new Date())
        console.log('토큰 만료 여부:', new Date() > new Date(payload.exp * 1000))
      }
    } catch (error) {
      console.error('토큰 디코딩 실패:', error)
    }
    console.log('========================')
  }

  // 컴포넌트 마운트 시 토큰 디버깅
  useEffect(() => {
    debugToken()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="font-bold text-2xl">SNAP</div>
        </div>
        <div className="flex items-center gap-2">
          {/* 테스트용 토큰 설정 버튼 */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={setTestToken}
            className="text-red-600"
          >
            김주민 토큰
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={setTempUserToken}
            className="text-blue-600"
          >
            임시사용자 토큰
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsPostCreateOpen(true)} 
            className="text-blue-600"
            data-testid="post-create-button"
          >
            글쓰기
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsSearchMode(!isSearchMode)}>
            <Search className="w-5 h-5" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setIsNotificationOpen(true)}
            >
              <Bell className="w-5 h-5" />
              {/* 실시간 알림 배지 */}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
              {/* 연결 상태 표시 */}
              <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </Button>
            {/* 연결 오류 시 재연결 버튼 */}
            {notificationError && !isConnected && (
              <button
                onClick={reconnect}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors whitespace-nowrap"
              >
                재연결
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchMode && (
        <div className="p-4 border-b bg-white flex-shrink-0">
          <Input
            placeholder="패션 정보를 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="border-b bg-white">
            <TabsList className="w-full grid grid-cols-3 bg-transparent h-12 p-0">
              <TabsTrigger
                value="home"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
              >
                홈
              </TabsTrigger>
              <TabsTrigger
                value="ranking"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
              >
                랭킹
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
              >
                팔로잉
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filters */}
          <div className="border-b bg-white p-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {Object.entries(filterOptions).map(([filterType, options]) => (
                <div key={filterType} className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1 whitespace-nowrap"
                  >
                    {filters[filterType as keyof typeof filters]}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Dropdown */}
            {showFilters && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                {Object.entries(filterOptions).map(([filterType, options]) => (
                  <div key={filterType} className="mb-3">
                    <div className="text-sm font-medium mb-2 capitalize">{filterType}</div>
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => (
                        <Badge
                          key={option}
                          variant={filters[filterType as keyof typeof filters] === option ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleFilterChange(filterType, option)}
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 text-sm text-gray-600">{getFilteredAndSortedPosts().length.toLocaleString()}개</div>
          </div>

          {/* Content */}
          <div className="w-full">
            <TabsContent value="home" className="m-0">
              <div className="p-3">
                
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">게시글을 불러오는 중...</div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>아직 게시글이 없습니다.</p>
                    <p>첫 번째 게시글을 작성해보세요!</p>
                  </div>
                ) : (
                  /* 피드 스타일 레이아웃 */
                  <div className="space-y-4">
                    {getFilteredAndSortedPosts().map((post) => (
                      <PostCard 
                        key={post.postId} 
                        post={post}
                        onLike={() => toggleLike(post.postId)}
                        onScrap={() => toggleScrap(post.postId)}
                        onPostClick={() => handlePostClick(post.postId)}
                      />
                    ))}
                  </div>
                )}
                
                {/* 백엔드 연결 실패 시 안내 메시지 */}
                {!loading && posts.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">백엔드 서버에 연결할 수 없습니다</h3>
                    <p className="mb-4">게시글을 불러오기 위해 백엔드 서버가 필요합니다.</p>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>• 백엔드 서버가 실행 중인지 확인해주세요</p>
                      <p>• 포트 8080에서 Spring Boot 애플리케이션이 실행되어야 합니다</p>
                      <p>• 터미널에서 <code className="bg-gray-100 px-1 rounded">./gradlew bootRun</code> 명령어를 실행해보세요</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ranking" className="m-0">
              <div className="p-4">
                {/* 랭킹 탭 내부 탭 */}
                <Tabs defaultValue="trending" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 bg-gray-100 h-10 p-1">
                    <TabsTrigger value="trending" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      트렌딩
                    </TabsTrigger>
                    <TabsTrigger value="daily" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      일일
                    </TabsTrigger>
                    <TabsTrigger value="weekly" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      주간
                    </TabsTrigger>
                  </TabsList>

                  {/* 트렌딩 랭킹 */}
                  <TabsContent value="trending" className="mt-4">
                    <RankingTabContent 
                      ranking={trendingRanking}
                      title="🔥 트렌딩 게시글"
                      description="지금 가장 인기 있는 게시글을 확인해보세요!"
                    />
                  </TabsContent>

                  {/* 일일 랭킹 */}
                  <TabsContent value="daily" className="mt-4">
                    <RankingTabContent 
                      ranking={dailyRanking}
                      title="📅 오늘의 인기 게시글"
                      description="오늘 가장 많은 관심을 받은 게시글입니다"
                    />
                  </TabsContent>

                  {/* 주간 랭킹 */}
                  <TabsContent value="weekly" className="mt-4">
                    <RankingTabContent 
                      ranking={weeklyRanking}
                      title="📊 이번 주 인기 게시글"
                      description="이번 주 가장 인기 있었던 게시글입니다"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="following" className="m-0">
              <div className="p-3">
                {followingPosts.loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">팔로잉 게시글을 불러오는 중...</div>
                  </div>
                ) : followingPosts.error ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">팔로잉 게시글 로드 실패</h3>
                    <p className="mb-4">{followingPosts.error}</p>
                    <Button onClick={followingPosts.refresh} variant="outline">
                      다시 시도
                    </Button>
                  </div>
                ) : followingPosts.posts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">팔로잉 게시글이 없습니다</h3>
                    <p className="mb-4">팔로우한 사용자들의 게시글이 여기에 표시됩니다.</p>
                    <p className="text-sm text-gray-400">다른 사용자를 팔로우해보세요!</p>
                  </div>
                ) : (
                  /* 3열 고정 그리드 레이아웃 */
                  <div className="grid grid-cols-3 gap-2">
                    {followingPosts.posts.map((post) => (
                      <Card key={post.postId} className="overflow-hidden cursor-pointer" onClick={() => handlePostClick(post.postId)}>
                        <div className="relative">
                          <img
                            src={post.mediaUrls.length > 0 ? post.mediaUrls[0] : "/file.svg"}
                            alt={post.content.substring(0, 20)}
                            className="w-full h-48 object-cover"
                          />

                          {/* Like Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 p-1 bg-white/20 backdrop-blur-sm rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLike(post.postId)
                            }}
                          >
                            <Heart className={`w-3 h-3 ${post.liked ? "fill-red-500 text-red-500" : "text-white"}`} />
                          </Button>
                          
                          {/* Scrap Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-12 p-1 bg-white/20 backdrop-blur-sm rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleScrap(post.postId)
                            }}
                            data-testid="scrap-button"
                            data-scraped={post.scraped || false}
                          >
                            <Bookmark className={`w-3 h-3 ${post.scraped ? "fill-blue-500 text-blue-500" : "text-white"}`} />
                          </Button>
                          
                          {/* Post Stats */}
                          <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded text-white text-xs p-1">
                            <div className="flex items-center justify-between">
                              <span>❤️ {post.likeCount}</span>
                              <span>💬 {post.commentCount}</span>
                              <span data-testid="scrap-count">🔖 {post.scrapCount}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* PostCreatePage 모달 */}
      <PostCreatePage 
        isOpen={isPostCreateOpen} 
        onClose={handlePostCreateClose} 
      />

      {/* Notification Modal */}
      <NotificationPage
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  )
}

/**
 * 랭킹 탭 내용 컴포넌트
 * 연매출 100억 서비스 수준의 UI/UX 구현
 */
interface RankingTabContentProps {
  ranking: {
    posts: RankingPost[]
    loading: boolean
    error: string | null
    hasMore: boolean
    loadMore: () => void
    refresh: () => void
    retry: () => void
  }
  title: string
  description: string
}

function RankingTabContent({ ranking, title, description }: RankingTabContentProps) {
  const { posts, loading, error, hasMore, loadMore, refresh, retry } = ranking

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">랭킹을 계산하는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">랭킹 로드 실패</h3>
        <p className="mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={retry} variant="outline">
            다시 시도
          </Button>
          <Button onClick={refresh} variant="outline">
            새로고침
          </Button>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">아직 랭킹 데이터가 없습니다</h3>
        <p className="mb-4">{description}</p>
        <Button onClick={refresh} variant="outline">
          새로고침
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={refresh} variant="outline" size="sm">
            새로고침
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            총 {posts.length}개
          </Badge>
        </div>
      </div>

      {/* 랭킹 게시글 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post, index) => (
          <Card key={post.postId} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
            <div className="relative">
              {/* 랭킹 순위 배지 */}
              <div className="absolute top-2 left-2 z-10">
                <Badge 
                  variant={index < 3 ? "default" : "secondary"}
                  className={`px-2 py-1 text-xs font-bold ${
                    index === 0 ? "bg-yellow-500 text-white" :
                    index === 1 ? "bg-gray-400 text-white" :
                    index === 2 ? "bg-orange-500 text-white" : ""
                  }`}
                >
                  {index + 1}위
                </Badge>
              </div>

              {/* 게시글 이미지 */}
              <img
                src={post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : "/file.svg"}
                alt={post.content.substring(0, 20)}
                className="w-full h-48 object-cover"
              />

              {/* 상호작용 버튼 */}
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: 좋아요 토글 구현
                  }}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? "fill-red-500 text-red-500" : "text-white"}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: 스크랩 토글 구현
                  }}
                >
                  <Bookmark className={`w-4 h-4 ${post.scraped ? "fill-blue-500 text-blue-500" : "text-white"}`} />
                </Button>
              </div>

              {/* 게시글 통계 */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded text-white text-xs p-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.commentCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3" />
                    {post.scrapCount}
                  </span>
                </div>
              </div>
            </div>

            {/* 게시글 정보 */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={post.authorProfileImage || "/file.svg"}
                  alt={post.authorName}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{post.authorName}</span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {post.content}
              </p>
              
              {/* 태그 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs px-2 py-1">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="mt-6 text-center">
          <Button 
            onClick={loadMore} 
            variant="outline"
            disabled={loading}
            className="px-6"
          >
            {loading ? "로딩 중..." : "더 보기"}
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * 개별 게시글 카드 컴포넌트 (팔로우/댓글 기능 포함)
 */
interface PostCardProps {
  post: Post
  onLike: () => void
  onScrap: () => void
  onPostClick: () => void
}

function PostCard({ post, onLike, onScrap, onPostClick }: PostCardProps) {
  const [commentText, setCommentText] = useState("")
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [displayCommentCount, setDisplayCommentCount] = useState(1) // 초기에는 1개만 표시
  
  // 팔로우 기능
  const { isFollowing, followerCount, isLoading: followLoading, toggleFollow } = useFollow(post.authorName)
  
  // 댓글 기능
  const { 
    comments, 
    isLoading: commentsLoading, 
    hasMore: hasMoreComments,
    loadMoreComments,
    createComment,
    toggleCommentLike
  } = useComments(post.postId)
  
  // 게시글 삭제 기능
  const { isDeleting, deletePost } = useDeletePost()
  
  // 차단 기능
  const { blockUser, isLoading: blockLoading } = useBlock()
  
  // 신고 기능
  const { reportPost, isLoading: reportLoading } = useReport()

  // 댓글 더보기 처리
  const handleLoadMoreComments = async () => {
    console.log('=== 댓글 더보기 클릭 ===', { 
      hasMoreComments, 
      commentsLoading, 
      currentDisplayCount: displayCommentCount,
      totalComments: comments.length 
    });
    
    // 백엔드에서 20개씩 가져오므로, 현재 표시 개수를 20씩 증가
    if (!commentsLoading) {
      console.log('댓글 더보기 시작');
      setDisplayCommentCount(prev => {
        const newCount = prev + 20; // 백엔드 페이지 크기에 맞춤
        console.log('댓글 표시 개수 업데이트:', { 이전: prev, 새로운: newCount });
        return newCount;
      });
    } else {
      console.log('댓글 로딩 중');
    }
  }

  // 댓글 모달 열기
  const handleCommentButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowCommentModal(true)
  }

  const handleCommentSubmit = async () => {
    if (commentText.trim() && !commentsLoading) {
      try {
        await createComment(commentText.trim())
        setCommentText("")
        // 댓글 작성 후 댓글 목록 새로고침
        // 댓글이 항상 표시되므로 별도 처리 불필요
      } catch (error) {
        console.error('댓글 작성 실패:', error)
      }
    }
  }

  const handleDeletePost = async () => {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      const success = await deletePost(post.postId)
      if (success) {
        // 게시글 삭제 성공 시 페이지 새로고침 또는 목록에서 제거
        window.location.reload()
      }
    }
  }

  const handleBlockUser = async () => {
    // 사용자명을 UUID로 매핑 (임시)
    const getUserUuid = (username: string): string => {
      const userMap: { [key: string]: string } = {
        '임시사용자': '4c12cfb2-c5b8-4ff6-96cc-afdb0168830d',
        '김주민': '87b18a9c-d2ba-4318-b9aa-859e03c5aad7'
      }
      return userMap[username] || username
    }

    const userUuid = getUserUuid(post.authorName)
    const success = await blockUser(userUuid, '게시글로부터 차단')
    
    if (success) {
      alert('사용자를 차단했습니다')
      // 차단 후 게시글이 즉시 숨겨지도록 페이지 새로고침
      window.location.reload()
    }
  }

  const handleReportPost = async () => {
    if (!reportReason.trim()) {
      alert('신고 사유를 입력해주세요')
      return
    }

    const success = await reportPost(post.postId, reportReason.trim())
    
    if (success) {
      alert('신고가 접수되었습니다')
      setShowReportModal(false)
      setReportReason("")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "오늘"
    if (diffDays === 2) return "어제"
    if (diffDays <= 7) return `${diffDays - 1}일 전`
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 댓글 표시 로직
  const visibleComments = comments.slice(0, displayCommentCount)
  const hasMoreToShow = comments.length > displayCommentCount
  const hasExpandedComments = displayCommentCount > 1
  
  // 댓글 렌더링 디버깅
  console.log('=== PostCard 댓글 렌더링 ===', {
    postId: post.postId,
    전체댓글수: comments.length,
    표시할댓글수: displayCommentCount,
    visibleComments: visibleComments.length,
    hasMoreToShow,
    hasExpandedComments,
    댓글데이터: comments
  });

  return (
    <Card className="overflow-hidden" data-testid="post-card">
      {/* 작성자 정보 및 팔로우/삭제 버튼 */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.authorProfileImage || "/placeholder.svg"}
            alt={post.authorName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-medium">{post.authorName}</div>
            <div className="text-sm text-gray-500">팔로워 {followerCount}명</div>
          </div>
        </div>
        
        {/* 자신의 게시글인지 확인 후 버튼 선택 */}
        {isCurrentUserPostAuthor(post.authorName) ? (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeletePost()
            }}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-100"
            data-testid="delete-post-button"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant={isFollowing ? "outline" : "default"} 
              size="sm"
              onClick={toggleFollow}
              disabled={followLoading}
              data-testid="follow-button"
            >
              {followLoading ? "처리중..." : (isFollowing ? "팔로잉" : "+ 팔로우")}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowBlockConfirm(true)
              }}
              disabled={blockLoading}
              className="p-2 hover:bg-gray-100 text-red-600 hover:bg-red-50"
              data-testid="block-user-button"
              title="사용자 차단"
            >
              차단
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowReportModal(true)
              }}
              disabled={reportLoading}
              className="p-2 hover:bg-gray-100 text-orange-600 hover:bg-orange-50"
              data-testid="report-post-button"
              title="게시글 신고"
            >
              신고
            </Button>
          </div>
        )}
      </div>

      {/* 게시글 이미지 */}
      <div className="relative cursor-pointer" onClick={onPostClick}>
        <img
          src={post.mediaUrls.length > 0 ? post.mediaUrls[0] : "/file.svg"}
          alt={post.content.substring(0, 20)}
          className="w-full h-64 object-cover"
        />
        
        {/* Like/Scrap 버튼 - 자신의 게시글이 아닐 때만 표시 */}
        {!isCurrentUserPostAuthor(post.authorName) && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 p-1 bg-white/20 backdrop-blur-sm rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                onLike()
              }}
              data-testid="like-button"
              data-liked={post.liked || false}
            >
              <Heart className={`w-4 h-4 ${post.liked ? "fill-red-500 text-red-500" : "text-white"}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-12 p-1 bg-white/20 backdrop-blur-sm rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                onScrap()
              }}
              data-testid="scrap-button"
              data-scraped={post.scraped || false}
            >
              <Bookmark className={`w-4 h-4 ${post.scraped ? "fill-blue-500 text-blue-500" : "text-white"}`} />
            </Button>
          </>
        )}
      </div>

      {/* 게시글 정보 */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button 
            onClick={onLike}
            className="flex items-center gap-1"
            data-testid="like-count"
          >
            <Heart className={`w-5 h-5 ${post.liked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{post.likeCount}</span>
          </button>
          {/* 댓글 버튼 */}
          <button 
            onClick={handleCommentButtonClick} // Changed onClick
            className="flex items-center gap-1"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{post.commentCount}</span>
          </button>
          

          <button 
            onClick={onScrap}
            className="flex items-center gap-1"
            data-testid="scrap-count"
          >
            <Bookmark className={`w-5 h-5 ${post.scraped ? "fill-blue-500 text-blue-500" : ""}`} />
            <span>{post.scrapCount}</span>
          </button>
        </div>
        
        <p className="text-sm mb-2">{post.content}</p>
        <div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div>
      </div>

      {/* 댓글 섹션 - 항상 표시 */}
      <div className="border-t bg-gray-50">
        {/* 댓글 입력 */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="댓글을 입력하세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && commentText.trim()) {
                  handleCommentSubmit();
                }
              }}
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              작성
            </button>
          </div>
        </div>
        
        {/* 댓글 목록 */}
        <div className="max-h-60 overflow-y-auto">
          {visibleComments.map((comment) => (
            <div key={comment.commentId} className="p-4 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.author?.nickname || '사용자'}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
          
                      {/* 댓글 더보기/접기 버튼 */}
            {comments.length > 0 && (
              <div className="p-4 text-center">
                {hasMoreToShow ? (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      console.log('=== 댓글 더보기 버튼 클릭 ===', {
                        현재표시개수: displayCommentCount,
                        전체댓글수: comments.length,
                        더보기가능: hasMoreToShow
                      });
                      handleLoadMoreComments();
                    }}
                    disabled={commentsLoading}
                    className="w-full"
                  >
                    {commentsLoading ? "로딩 중..." : `댓글 더보기 (${comments.length - displayCommentCount}개 더)`}
                  </Button>
                ) : hasExpandedComments ? (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      console.log('댓글 접기 클릭');
                      setDisplayCommentCount(1);
                    }}
                    className="w-full"
                  >
                    댓글 접기
                  </Button>
                ) : null}
              </div>
            )}
        </div>
      </div>
      
      {/* 댓글 모달 */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col">
            {/* 모달 헤더 */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">댓글 {post.commentCount}개</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCommentModal(false)}
              >
                ✕
              </Button>
            </div>
            
            {/* 댓글 입력 */}
            <div className="p-4 border-b">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCommentSubmit()}
                  className="flex-1"
                  disabled={commentsLoading}
                />
                <Button 
                  onClick={handleCommentSubmit} 
                  disabled={!commentText.trim() || commentsLoading}
                >
                  {commentsLoading ? "전송중..." : "전송"}
                </Button>
              </div>
            </div>
            
            {/* 댓글 목록 */}
            <div className="flex-1 overflow-y-auto p-4">
              {comments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  첫 댓글을 남겨주세요.
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.commentId} className="flex items-start gap-3">
                      <img
                        src={comment.author?.profileImage || "/placeholder.svg"}
                        alt={comment.author?.nickname || "익명"}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{comment.author?.nickname || "익명"}</div>
                        <div className="text-sm mt-1">{comment.content}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{formatDate(comment.createdAt)}</span>
                          <button 
                            onClick={() => toggleCommentLike(comment.commentId)}
                            className="flex items-center gap-1 hover:text-red-500"
                          >
                            <Heart className={`w-3 h-3 ${comment.liked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{comment.likeCount}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* 댓글 더보기 버튼 */}
                  {hasMoreComments && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={handleLoadMoreComments}
                        disabled={commentsLoading}
                      >
                        {commentsLoading ? "로딩 중..." : "댓글 더보기"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 차단 확인 모달 */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="block-confirm-modal">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">사용자 차단</h3>
            <p className="text-gray-600 mb-6">
              '{post.authorName}'님을 차단하시겠습니까?<br/>
              차단하면 이 사용자의 게시글과 댓글이 더 이상 보이지 않습니다.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowBlockConfirm(false)}
                disabled={blockLoading}
              >
                취소
              </Button>
              <Button 
                variant="destructive"
                onClick={async () => {
                  setShowBlockConfirm(false)
                  await handleBlockUser()
                }}
                disabled={blockLoading}
                data-testid="confirm-block-button"
              >
                {blockLoading ? "처리중..." : "차단"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 신고 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="report-modal">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">게시글 신고</h3>
            <p className="text-gray-600 mb-4">
              이 게시글을 신고하는 이유를 선택해주세요.
            </p>
            <div className="space-y-2 mb-6">
              {[
                "부적절한 콘텐츠",
                "스팸 또는 광고",
                "괴롭힘 또는 혐오 발언",
                "저작권 침해", 
                "기타"
              ].map((reason) => (
                <label key={reason} className="flex items-center">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mr-2"
                  />
                  {reason}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowReportModal(false)
                  setReportReason("")
                }}
                disabled={reportLoading}
              >
                취소
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReportPost}
                disabled={!reportReason || reportLoading}
                data-testid="confirm-report-button"
              >
                {reportLoading ? "처리중..." : "신고"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
