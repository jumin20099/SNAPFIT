"use client"

import { useState } from "react"
import { ArrowLeft, Heart, Search, Bell, User, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface OutfitPost {
  id: number
  image: string
  user: string
  userAvatar: string
  likes: number
  liked: boolean
  tags: string[]
  style: string
  season: string
  gender: string
}

const mockOutfitPosts: OutfitPost[] = [
  {
    id: 1,
    image: "/placeholder.svg?height=400&width=300",
    user: "스타일리스트_민지",
    userAvatar: "/placeholder.svg?height=40&width=40",
    likes: 234,
    liked: false,
    tags: ["캐주얼", "데일리"],
    style: "캐주얼",
    season: "봄",
    gender: "여성",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=500&width=300",
    user: "패션_준호",
    userAvatar: "/placeholder.svg?height=40&width=40",
    likes: 189,
    liked: true,
    tags: ["스트릿", "힙합"],
    style: "스트릿",
    season: "여름",
    gender: "남성",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=350&width=300",
    user: "코디_소희",
    userAvatar: "/placeholder.svg?height=40&width=40",
    likes: 456,
    liked: false,
    tags: ["오피스룩", "정장"],
    style: "포멀",
    season: "가을",
    gender: "여성",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=450&width=300",
    user: "멋쟁이_현우",
    userAvatar: "/placeholder.svg?height=40&width=40",
    likes: 321,
    liked: true,
    tags: ["빈티지", "레트로"],
    style: "빈티지",
    season: "겨울",
    gender: "남성",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=380&width=300",
    user: "패션_지은",
    userAvatar: "/placeholder.svg?height=40&width=40",
    likes: 567,
    liked: false,
    tags: ["미니멀", "심플"],
    style: "미니멀",
    season: "봄",
    gender: "여성",
  },
  {
    id: 6,
    image: "/placeholder.svg?height=420&width=300",
    user: "스타일_태민",
    userAvatar: "/placeholder.svg?height=40&width=40",
    likes: 298,
    liked: false,
    tags: ["스포티", "애슬레저"],
    style: "스포티",
    season: "여름",
    gender: "남성",
  },
]

const filterOptions = {
  gender: ["전체", "남성", "여성"],
  style: ["전체", "캐주얼", "스트릿", "포멀", "빈티지", "미니멀", "스포티"],
  season: ["전체", "봄", "여름", "가을", "겨울"],
  category: ["전체", "상의", "하의", "아우터", "신발", "가방", "액세서리"],
}

interface OutfitSharingPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function OutfitSharingPage({ isOpen, onClose }: OutfitSharingPageProps) {
  const [activeTab, setActiveTab] = useState("cody")
  const [posts, setPosts] = useState(mockOutfitPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    gender: "전체",
    style: "전체",
    season: "전체",
    category: "전체",
  })

  const toggleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
          : post,
      ),
    )
  }

  const getFilteredPosts = () => {
    return posts.filter((post) => {
      if (filters.gender !== "전체" && post.gender !== filters.gender) return false
      if (filters.style !== "전체" && post.style !== filters.style) return false
      if (filters.season !== "전체" && post.season !== filters.season) return false
      if (searchQuery && !post.tags.some((tag) => tag.includes(searchQuery))) return false
      return true
    })
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }))
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
          <div className="font-bold text-2xl">SNAP</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsSearchMode(!isSearchMode)}>
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchMode && (
        <div className="p-4 border-b bg-white flex-shrink-0">
          <Input
            placeholder="스타일, 태그로 검색해보세요..."
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
                value="cody"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
              >
                코디
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

            <div className="mt-2 text-sm text-gray-600">{getFilteredPosts().length.toLocaleString()}개</div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="cody" className="h-full m-0">
              <div className="p-3">
                {/* 3열 고정 그리드 레이아웃 */}
                <div className="grid grid-cols-3 gap-2">
                  {getFilteredPosts().map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={`${post.user}의 코디`}
                          className="w-full h-48 object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Like Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 p-1 bg-white/20 backdrop-blur-sm rounded-full"
                          onClick={() => toggleLike(post.id)}
                        >
                          <Heart className={`w-3 h-3 ${post.liked ? "fill-red-500 text-red-500" : "text-white"}`} />
                        </Button>

                        {/* User Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                          <div className="flex items-center gap-1 mb-1">
                            <img
                              src={post.userAvatar || "/placeholder.svg"}
                              alt={post.user}
                              className="w-4 h-4 rounded-full"
                            />
                            <span className="text-xs font-medium truncate">{post.user}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 1).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs bg-white/20 text-white border-white/30 px-1 py-0"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Heart className="w-2 h-2" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ranking" className="h-full m-0">
              <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <h3 className="text-lg font-medium mb-2">인기 코디 랭킹</h3>
                <p>가장 인기있는 코디들을 확인해보세요!</p>
              </div>
            </TabsContent>

            <TabsContent value="following" className="h-full m-0">
              <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <h3 className="text-lg font-medium mb-2">팔로잉</h3>
                <p>팔로우한 사용자들의 최신 코디를 확인해보세요!</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
