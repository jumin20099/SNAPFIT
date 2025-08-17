"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Heart, Search, Bell, User, Filter, ChevronDown, Home, Users, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import PostDetailPage from "./post-detail-page"
import PostCreatePage from "./post-create-page"

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

interface CommunityPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommunityPage({ isOpen, onClose }: CommunityPageProps) {
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
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)

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
    if (isOpen) {
      fetchPosts()
    }
  }, [isOpen])

  const toggleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.postId === postId
          ? { ...post, likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1, liked: !post.liked }
          : post,
      ),
    )
  }

  const toggleScrap = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.postId === postId
          ? { ...post, scrapCount: post.scraped ? post.scrapCount - 1 : post.scrapCount + 1, scraped: !post.scraped }
          : post,
      ),
    )
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
    setSelectedPostId(postId)
  }

  const handleClosePostDetail = () => {
    setSelectedPostId(null)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }))
  }

  if (!isOpen) return null

  // 게시글 상세 페이지가 열려있으면 해당 컴포넌트 렌더링
  if (selectedPostId !== null) {
    return <PostDetailPage isOpen={true} onClose={handleClosePostDetail} postId={selectedPostId} />
  }

  // 글 작성 페이지가 열려있으면 해당 컴포넌트 렌더링
  if (isCreatePostOpen) {
    return <PostCreatePage isOpen={true} onClose={() => setIsCreatePostOpen(false)} />
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="font-bold text-2xl">SNAP</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsCreatePostOpen(true)} className="text-blue-600">
            글쓰기
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsSearchMode(!isSearchMode)}>
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>
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
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b bg-white flex-shrink-0">
            <TabsList className="w-full grid grid-cols-3 bg-transparent h-12 p-0">
              <TabsTrigger
                value="home"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
              >
                홈
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
              >
                팔로잉
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
              >
                프로필
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filters */}
          <div className="border-b bg-white p-3 flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="home" className="h-full m-0">
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
                  /* 3열 고정 그리드 레이아웃 */
                  <div className="grid grid-cols-3 gap-2">
                    {getFilteredAndSortedPosts().map((post) => (
                      <Card key={post.postId} className="overflow-hidden cursor-pointer" onClick={() => handlePostClick(post.postId)}>
                        <div className="relative">
                          <img
                            src={post.mediaUrls.length > 0 ? post.mediaUrls[0] : "/placeholder.svg"}
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
                        </div>
                      </Card>
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

            <TabsContent value="following" className="h-full m-0">
              <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <Users className="w-12 h-12 mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">팔로잉</h3>
                <p>팔로우한 사용자들의 최신 게시글을 확인해보세요!</p>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="h-full m-0">
              <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-4"></div>
                <h3 className="text-lg font-medium mb-2">프로필</h3>
                <p>나만의 스타일을 공유하고 다른 사용자들과 소통해보세요!</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
