"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Search,
  ChevronDown,
  MoreHorizontal,
  Home,
  Users,
  User,
  Bookmark,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

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

const mockPosts: Post[] = [
  {
    id: 1,
    title: "2024 가을/겨울 트렌드 완벽 분석: 꼭 알아야 할 5가지 스타일",
    content:
      "올해 가을겨울 시즌의 핵심 트렌드를 분석해보았습니다. 오버사이즈 코트부터 레트로 컬러까지, 패션 위크에서 발견한 트렌드들을 실제 코디에 어떻게 적용할 수 있는지 상세히 알아보세요. 특히 한국 브랜드들의 해석과 글로벌 트렌드의 차이점도...",
    author: "fashion_analyst",
    authorImage: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=300&width=400",
    likes: 342,
    comments: 67,
    scraps: 89,
    date: "2024-05-19",
    readTime: "8분",
    tags: ["트렌드", "가을패션", "스타일링"],
    type: "trend",
    liked: false,
    scraped: false,
  },
  {
    id: 2,
    title: "작은 키를 위한 스타일링 가이드: 비율 살리는 코디 법칙",
    content:
      "키가 작다고 해서 포기할 필요 없어요! 시각적으로 키를 커 보이게 하는 스타일링 팁들을 정리했습니다. 하이웨스트 활용법, 세로 라인 만들기, 적절한 기장 선택까지. 실제 코디 예시와 함께 자세히 설명드려요.",
    author: "petite_stylist",
    authorImage: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=300&width=400",
    likes: 289,
    comments: 45,
    scraps: 67,
    date: "2024-05-18",
    readTime: "6분",
    tags: ["스타일링", "체형보완", "코디팁"],
    type: "styling",
    liked: false,
    scraped: false,
  },
  {
    id: 3,
    title: "유니클로 vs 자라 vs H&M: 가성비 브랜드 완벽 비교 리뷰",
    content:
      "SPA 브랜드 3사의 2024년 신상품을 직접 구매해서 비교해봤습니다. 소재의 질, 핏, 가격 대비 만족도까지 솔직한 후기를 공유합니다. 각 브랜드별 추천 아이템과 피해야 할 아이템도 함께 정리했어요.",
    author: "honest_reviewer",
    authorImage: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=300&width=400",
    likes: 456,
    comments: 89,
    scraps: 123,
    date: "2024-05-17",
    readTime: "12분",
    tags: ["리뷰", "가성비", "브랜드비교"],
    type: "review",
    liked: false,
    scraped: false,
  },
  {
    id: 4,
    title: "직장인을 위한 캡슐 워드로브 구성법: 30벌로 1년 버티기",
    content:
      "최소한의 옷으로 최대한의 스타일링을 만들어내는 캡슐 워드로브 구성법을 소개합니다. 기본 아이템 선정부터 믹스앤매치 방법까지, 실용적이면서도 세련된 직장인 스타일을 완성해보세요. 계절별 추가 아이템 리스트도 포함되어 있어요.",
    author: "office_style",
    authorImage: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=300&width=400",
    likes: 378,
    comments: 52,
    scraps: 95,
    date: "2024-05-16",
    readTime: "10분",
    tags: ["직장인패션", "캡슐워드로브", "미니멀"],
    type: "info",
    liked: false,
    scraped: false,
  },
  {
    id: 5,
    title: "컬러 매칭의 과학: 피부톤별 완벽한 색상 조합 찾기",
    content:
      "퍼스널 컬러 진단부터 실제 코디 적용까지! 웜톤, 쿨톤별로 어울리는 색상 조합을 과학적으로 분석했습니다. 단순히 유행하는 색이 아닌, 나에게 진짜 어울리는 색을 찾는 방법을 알려드려요. 메이크업과의 조화까지 고려한 토탈 컬러링 가이드입니다.",
    author: "color_expert",
    authorImage: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=300&width=400",
    likes: 267,
    comments: 34,
    scraps: 78,
    date: "2024-05-15",
    readTime: "7분",
    tags: ["컬러매칭", "퍼스널컬러", "스타일링"],
    type: "fashion-tip",
    liked: false,
    scraped: false,
  },
  {
    id: 6,
    title: "지속가능한 패션: 환경을 생각하는 스마트한 쇼핑법",
    content:
      "패스트 패션의 문제점과 지속가능한 패션의 중요성에 대해 이야기해보려고 합니다. 오래 입을 수 있는 옷을 고르는 기준, 빈티지 쇼핑 노하우, 옷 관리법까지. 환경도 지키고 스타일도 살리는 현명한 소비 방법을 제안합니다.",
    author: "eco_fashionista",
    authorImage: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=300&width=400",
    likes: 198,
    comments: 28,
    scraps: 56,
    date: "2024-05-14",
    readTime: "9분",
    tags: ["지속가능패션", "환경", "빈티지"],
    type: "info",
    liked: false,
    scraped: false,
  },
  {
    id: 7,
    title: "K-패션의 글로벌 진출: 한국 브랜드가 세계를 사로잡는 이유",
    content:
      "한국 패션이 전 세계적으로 주목받고 있는 현상을 분석해봤습니다. K-pop과 K-드라마의 영향, 한국 디자이너들의 독창성, 그리고 글로벌 시장에서의 성공 사례들을 통해 K-패션의 미래를 전망해보세요.",
    author: "k_fashion_insider",
    authorImage: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=300&width=400",
    likes: 423,
    comments: 76,
    scraps: 134,
    date: "2024-05-13",
    readTime: "11분",
    tags: ["K패션", "글로벌", "트렌드"],
    type: "trend",
    liked: false,
    scraped: false,
  },
]

const sortOptions = ["최신순", "좋아요순", "댓글순", "스크랩순"]

interface CommunityPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommunityPage({ isOpen, onClose }: CommunityPageProps) {
  const [posts, setPosts] = useState(mockPosts)
  const [activeSortOption, setActiveSortOption] = useState("최신순")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "trend":
        return "bg-purple-100 text-purple-800"
      case "styling":
        return "bg-blue-100 text-blue-800"
      case "review":
        return "bg-green-100 text-green-800"
      case "info":
        return "bg-orange-100 text-orange-800"
      case "fashion-tip":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  if (!isOpen) return null

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
              <div className="p-4 space-y-6 pb-20">
                {getSortedPosts().map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={post.thumbnail || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={`text-xs ${getTypeColor(post.type)}`}>
                          {post.type === "trend"
                            ? "트렌드"
                            : post.type === "styling"
                              ? "스타일링"
                              : post.type === "review"
                                ? "리뷰"
                                : post.type === "info"
                                  ? "정보"
                                  : "패션팁"}
                        </Badge>
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.authorImage || "/placeholder.svg"}
                            alt={post.author}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDate(post.date)}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLike(post.id)
                            }}
                          >
                            <Heart
                              className={`w-4 h-4 ${post.liked ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                            />
                            <span className="text-sm">{post.likes}</span>
                          </Button>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">{post.comments}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleScrap(post.id)
                            }}
                          >
                            <Bookmark
                              className={`w-4 h-4 ${post.scraped ? "fill-blue-500 text-blue-500" : "text-gray-500"}`}
                            />
                            <span className="text-sm">{post.scraps}</span>
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
