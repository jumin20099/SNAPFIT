"use client"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, ArrowLeft, ShoppingBag, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface LikedPost {
  postId: number
  content: string
  authorName: string
  authorProfileImage: string
  mediaUrls: string[]
  likeCount: number
  commentCount: number
  scrapCount: number
  createdAt: string
  tags: string[]
  liked: boolean
}

interface LikedProduct {
  productId: number
  name: string
  price: number
  imageUrl: string
  category: string
  storeName: string
  liked: boolean
}

interface LikedBrand {
  brandId: number
  name: string
  logoUrl: string
  description: string
  followerCount: number
  liked: boolean
}

export default function LikedItemsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("posts")
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([])
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([])
  const [likedBrands, setLikedBrands] = useState<LikedBrand[]>([])
  const [loading, setLoading] = useState(false)

  // 좋아요한 게시글 가져오기
  const fetchLikedPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/likes/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // 게시글 데이터로 변환 (실제 API 응답에 따라 조정 필요)
        const posts = data.map((item: any) => ({
          postId: item.postId,
          content: item.content || '내용 없음',
          authorName: item.author?.nickname || '익명',
          authorProfileImage: item.author?.profileImage || '/placeholder.svg',
          mediaUrls: item.mediaUrls || [],
          likeCount: item.likeCount || 0,
          commentCount: item.commentCount || 0,
          scrapCount: item.scrapCount || 0,
          createdAt: item.createdAt || new Date().toISOString(),
          tags: item.tags || [],
          liked: true
        }))
        setLikedPosts(posts)
      }
    } catch (error) {
      console.error('좋아요한 게시글 로드 실패:', error)
    }
  }

  // 좋아요한 상품 가져오기 (임시 데이터)
  const fetchLikedProducts = async () => {
    // TODO: 실제 API 연동
    const mockProducts: LikedProduct[] = [
      {
        productId: 1,
        name: "베이직 티셔츠",
        price: 29000,
        imageUrl: "/placeholder.svg",
        category: "상의",
        storeName: "스냅핏 스토어",
        liked: true
      },
      {
        productId: 2,
        name: "데님 팬츠",
        price: 59000,
        imageUrl: "/placeholder.svg",
        category: "하의",
        storeName: "패션몰",
        liked: true
      }
    ]
    setLikedProducts(mockProducts)
  }

  // 좋아요한 브랜드 가져오기 (임시 데이터)
  const fetchLikedBrands = async () => {
    // TODO: 실제 API 연동
    const mockBrands: LikedBrand[] = [
      {
        brandId: 1,
        name: "스냅핏",
        logoUrl: "/placeholder.svg",
        description: "트렌디한 패션 브랜드",
        followerCount: 1250,
        liked: true
      },
      {
        brandId: 2,
        name: "패션스타",
        logoUrl: "/placeholder.svg",
        description: "유니크한 디자인",
        followerCount: 890,
        liked: true
      }
    ]
    setLikedBrands(mockBrands)
  }

  // 좋아요 토글 (게시글)
  const togglePostLike = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      })

      if (response.ok) {
        setLikedPosts(prev => prev.filter(post => post.postId !== postId))
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
    }
  }

  // 좋아요 토글 (상품)
  const toggleProductLike = async (productId: number) => {
    // TODO: 실제 API 연동
    setLikedProducts(prev => prev.filter(product => product.productId !== productId))
  }

  // 좋아요 토글 (브랜드)
  const toggleBrandLike = async (brandId: number) => {
    // TODO: 실제 API 연동
    setLikedBrands(prev => prev.filter(brand => brand.brandId !== brandId))
  }

  useEffect(() => {
    fetchLikedPosts()
    fetchLikedProducts()
    fetchLikedBrands()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

    if (diffHours < 1) return "방금 전"
    if (diffHours === 1) return "1시간 전"
    if (diffHours < 24) return `${diffHours}시간 전`
    return `${Math.ceil(diffHours / 24)}일 전`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">좋아요한 목록</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">게시글</TabsTrigger>
            <TabsTrigger value="products">상품</TabsTrigger>
            <TabsTrigger value="brands">브랜드</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} className="w-full">
          {/* 게시글 탭 */}
          <TabsContent value="posts" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              좋아요한 게시글 {likedPosts.length}개
            </div>
            
            {likedPosts.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">좋아요한 게시글이 없습니다</h3>
                <p className="text-gray-500">마음에 드는 게시글에 좋아요를 눌러보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                                 {likedPosts.map((post) => (
                   <div 
                     key={post.postId} 
                     className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow"
                     onClick={() => router.push(`/community/${post.postId}`)}
                   >
                    {/* 작성자 정보 */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.authorProfileImage} />
                        <AvatarFallback>{post.authorName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{post.authorName}</div>
                        <div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div>
                      </div>
                                             <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={(e) => {
                           e.stopPropagation()
                           togglePostLike(post.postId)
                         }}
                         className="p-1 h-8 w-8"
                       >
                         <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                       </Button>
                    </div>

                    {/* 게시글 내용 */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                    </div>

                    {/* 이미지 */}
                    {post.mediaUrls.length > 0 && (
                      <div className="mb-3">
                        <img 
                          src={post.mediaUrls[0]} 
                          alt="게시글 이미지"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* 태그 */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likeCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        <span>{post.scrapCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 상품 탭 */}
          <TabsContent value="products" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              좋아요한 상품 {likedProducts.length}개
            </div>
            
            {likedProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">좋아요한 상품이 없습니다</h3>
                <p className="text-gray-500">마음에 드는 상품에 좋아요를 눌러보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {likedProducts.map((product) => (
                  <div key={product.productId} className="bg-white rounded-lg border p-3">
                    <div className="relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleProductLike(product.productId)}
                        className="absolute top-2 right-2 p-1 h-6 w-6 bg-white/80 hover:bg-white"
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.storeName}</p>
                      <p className="font-bold text-sm">{product.price.toLocaleString()}원</p>
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 브랜드 탭 */}
          <TabsContent value="brands" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              좋아요한 브랜드 {likedBrands.length}개
            </div>
            
            {likedBrands.length === 0 ? (
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">좋아요한 브랜드가 없습니다</h3>
                <p className="text-gray-500">마음에 드는 브랜드에 좋아요를 눌러보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {likedBrands.map((brand) => (
                  <div key={brand.brandId} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={brand.logoUrl} 
                          alt={brand.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{brand.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{brand.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>팔로워 {brand.followerCount.toLocaleString()}명</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleBrandLike(brand.brandId)}
                        className="p-2 h-10 w-10"
                      >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
