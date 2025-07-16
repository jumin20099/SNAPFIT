"use client"

import { useState } from "react"
import { ArrowLeft, Heart, MessageSquare, Search, ChevronDown, Home, Users, User, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostDetailPage from "./post-detail-page"
import PostCreatePage from "./post-create-page"

interface Post {
  id: number
  title: string
  content: string
  author: string
  authorImage: string
  thumbnail: string
  likes: number
  comments: number
  scraps: number
  date: string
  readTime: string
  tags: string[]
  liked?: boolean
  scraped?: boolean
  type: "fashion-tip" | "review" | "trend" | "styling" | "info"
}

const sortOptions = ["최신순", "좋아요순", "댓글순", "스크랩순"]

interface CommunityPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommunityPage({ isOpen, onClose }: CommunityPageProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeSortOption, setActiveSortOption] = useState("최신순")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)

  const toggleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
          : post,
      ),
    )
  }

  const toggleScrap = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, scraps: post.scraped ? post.scraps - 1 : post.scraps + 1, scraped: !post.scraped }
          : post,
      ),
    )
  }

  const getSortedPosts = () => {
    const sortedPosts = [...posts]
    switch (activeSortOption) {
      case "좋아요순":
        return sortedPosts.sort((a, b) => b.likes - a.likes)
      case "댓글순":
        return sortedPosts.sort((a, b) => b.comments - a.comments)
      case "스크랩순":
        return sortedPosts.sort((a, b) => b.scraps - a.scraps)
      case "최신순":
      default:
        return sortedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
          <div className="font-bold text-xl">SNAPFIT</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsCreatePostOpen(true)} className="text-blue-600">
            글쓰기
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsSearchMode(!isSearchMode)}>
            <Search className="w-5 h-5" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="flex items-center gap-1"
            >
              {activeSortOption}
              <ChevronDown className="w-4 h-4" />
            </Button>
            {showSortOptions && (
              <div className="absolute right-0 top-full mt-1 bg-white border shadow-md rounded-md z-10 min-w-24">
                {sortOptions.map((option) => (
                  <Button
                    key={option}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start px-3 py-2 ${activeSortOption === option ? "bg-gray-100" : ""}`}
                    onClick={() => {
                      setActiveSortOption(option)
                      setShowSortOptions(false)
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="home" className="h-full m-0">
              <div className="pb-20">
                {getSortedPosts().map((post) => (
                  <div
                    key={post.id}
                    className="border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePostClick(post.id)}
                  >
                    <div className="flex gap-3">
                      {/* 썸네일 이미지 */}
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded">
                        <img
                          src={post.thumbnail || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 게시글 정보 */}
                      <div className="flex-1 min-w-0">
                        {/* 제목과 댓글수 */}
                        <h3 className="font-medium text-base mb-1 line-clamp-2 text-blue-600">
                          {post.title} <span className="text-blue-500">[{post.comments}]</span>
                        </h3>

                        {/* 작성자와 시간 */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>{post.author}</span>
                          <span>-</span>
                          <span>{formatDate(post.date)}</span>
                        </div>

                        {/* 통계 정보 */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bookmark className="w-4 h-4" />
                            <span>{post.scraps}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>조회 {Math.floor(Math.random() * 1000) + 100}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="following" className="h-full m-0">
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <Users className="w-12 h-12 mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">팔로우한 사용자의 글이 여기에 표시됩니다</h3>
                <p>관심있는 패션 크리에이터를 팔로우해보세요!</p>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="h-full m-0">
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-4"></div>
                <h3 className="text-lg font-medium mb-2">프로필을 설정해보세요</h3>
                <p>나만의 스타일을 공유하고 다른 사용자들과 소통해보세요!</p>
              </div>
            </TabsContent>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t bg-white flex-shrink-0">
            <TabsList className="w-full grid grid-cols-3 bg-transparent h-16 p-0">
              <TabsTrigger
                value="home"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none flex flex-col gap-1 h-full"
              >
                <Home className="w-5 h-5" />
                <span className="text-xs">홈</span>
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none flex flex-col gap-1 h-full"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">팔로잉</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none flex flex-col gap-1 h-full"
              >
                <User className="w-5 h-5" />
                <span className="text-xs">프로필</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
