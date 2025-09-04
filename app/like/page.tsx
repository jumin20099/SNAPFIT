"use client"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, ArrowLeft, ShoppingBag, Store, Loader2 } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [brandsLoading, setBrandsLoading] = useState(false)

  // 좋아요한 게시글 가져오기
  const fetchLikedPosts = async () => {
    try {
      setPostsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      // 1. 좋아요한 게시글 ID 목록 가져오기
      const likesResponse = await fetch('/api/likes/my/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

              if (likesResponse.ok) {
          const likedItems = await likesResponse.json()
          console.log('좋아요한 게시글 ID 목록:', likedItems)
          const postIds = likedItems.map((item: any) => item.targetIdx)
          console.log('추출된 게시글 ID들:', postIds)
          
          if (postIds.length === 0) {
            setLikedPosts([])
            return
          }

        // 2. 게시글 상세 정보 가져오기
        const postsResponse = await fetch('/api/posts/liked', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ postIds })
        })

        console.log('게시글 API 응답 상태:', postsResponse.status, postsResponse.statusText)
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          console.log('게시글 상세 데이터:', postsData)
          console.log('게시글 데이터 타입:', typeof postsData, Array.isArray(postsData))
          if (Array.isArray(postsData)) {
            console.log('게시글 개수:', postsData.length)
            postsData.forEach((post, index) => {
              console.log(`게시글 ${index}:`, post)
            })
          }
          const posts = postsData.map((post: any) => {
            console.log('개별 게시글 데이터:', post)
            return {
              postId: post.postIdx || post.postId,
              content: post.content || '내용 없음',
              authorName: post.authorName || post.author?.nickname || '익명',
              authorProfileImage: post.authorProfileImage || post.author?.profileImage || '/placeholder.svg',
              mediaUrls: post.mediaUrls || [],
              likeCount: post.likeCount || 0,
              commentCount: post.commentCount || 0,
              scrapCount: post.scrapCount || 0,
              createdAt: post.createdAt || new Date().toISOString(),
              tags: post.tags || [],
              liked: true
            }
          })
          console.log('변환된 게시글 데이터:', posts)
          setLikedPosts(posts)
        }
      }
    } catch (error) {
      console.error('좋아요한 게시글 로드 실패:', error)
      setLikedPosts([])
    } finally {
      setPostsLoading(false)
    }
  }

  // 좋아요한 상품 가져오기
  const fetchLikedProducts = async () => {
    try {
      setProductsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      // 1. 좋아요한 상품 ID 목록 가져오기
      const likesResponse = await fetch('/api/likes/my/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (likesResponse.ok) {
        const likedItems = await likesResponse.json()
        console.log('좋아요한 상품 ID 목록:', likedItems)
        const productIds = likedItems.map((item: any) => item.targetIdx)
        console.log('추출된 상품 ID들:', productIds)
        
        if (productIds.length === 0) {
          setLikedProducts([])
          return
        }

        // 2. 상품 상세 정보 가져오기
        const productsResponse = await fetch('/api/products/liked', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productIds })
        })

        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          console.log('상품 상세 데이터:', productsData)
          const products = productsData.map((item: any) => {
            console.log('개별 상품 데이터:', item)
            const product = item.product // 실제 상품 데이터는 product 필드 안에 있음
            return {
              productId: product.productIdx,
              name: product.productName || '상품명 없음',
              price: product.productPrice || 0,
              imageUrl: product.productImage || '/placeholder.svg',
              category: product.majorCategory || '카테고리 없음',
              storeName: '스토어명 없음', // TODO: 스토어 정보 연동
              liked: true
            }
          })
          console.log('변환된 상품 데이터:', products)
          setLikedProducts(products)
        }
      }
    } catch (error) {
      console.error('좋아요한 상품 로드 실패:', error)
      setLikedProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  // 좋아요한 브랜드 가져오기
  const fetchLikedBrands = async () => {
    try {
      setBrandsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/likes/my/brands', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const likedItems = await response.json()
        console.log('좋아요한 브랜드 ID 목록:', likedItems)
        // TODO: 브랜드 상세 정보 API 구현 후 실제 데이터로 교체
        // 현재는 좋아요한 브랜드가 없다고 표시
        setLikedBrands([])
      }
    } catch (error) {
      console.error('좋아요한 브랜드 로드 실패:', error)
      setLikedBrands([])
    } finally {
      setBrandsLoading(false)
    }
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
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          targetIdx: productId, 
          targetType: 'PRODUCT' 
        })
      })

      if (response.ok) {
        setLikedProducts(prev => prev.filter(product => product.productId !== productId))
      }
    } catch (error) {
      console.error('상품 좋아요 토글 실패:', error)
    }
  }

  // 좋아요 토글 (브랜드)
  const toggleBrandLike = async (brandId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          targetIdx: brandId, 
          targetType: 'BRAND' 
        })
      })

      if (response.ok) {
        setLikedBrands(prev => prev.filter(brand => brand.brandId !== brandId))
      }
    } catch (error) {
      console.error('브랜드 좋아요 토글 실패:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchLikedPosts(),
        fetchLikedProducts(),
        fetchLikedBrands()
      ])
      setLoading(false)
    }
    loadData()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">좋아요 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">좋아요한 목록</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="posts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                게시글
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                상품
              </TabsTrigger>
              <TabsTrigger value="brands" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                브랜드
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <Tabs value={activeTab} className="w-full">
          {/* 게시글 탭 */}
          <TabsContent value="posts" className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              좋아요한 게시글 {likedPosts.length}개
            </div>
            
            {postsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">게시글을 불러오는 중...</p>
              </div>
            ) : likedPosts.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">좋아요한 게시글이 없습니다</h3>
                <p className="text-gray-500 dark:text-gray-400">마음에 드는 게시글에 좋아요를 눌러보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                                 {likedPosts.map((post, index) => (
                   <div 
                     key={`post-${post.postId}-${index}`} 
                     className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow"
                     onClick={() => router.push(`/community/${post.postId}`)}
                   >
                    {/* 작성자 정보 */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.authorProfileImage} />
                        <AvatarFallback>{post.authorName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{post.authorName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</div>
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
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{post.content}</p>
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
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              좋아요한 상품 {likedProducts.length}개
            </div>
            
            {productsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">상품을 불러오는 중...</p>
              </div>
            ) : likedProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">좋아요한 상품이 없습니다</h3>
                <p className="text-gray-500 dark:text-gray-400">마음에 드는 상품에 좋아요를 눌러보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                                 {likedProducts.map((product, index) => (
                   <div 
                     key={`product-${product.productId}-${index}`} 
                     className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow"
                     onClick={() => router.push(`/products/${product.productId}`)}
                   >
                    <div className="relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                                             <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={(e) => {
                           e.stopPropagation()
                           toggleProductLike(product.productId)
                         }}
                         className="absolute top-2 right-2 p-1 h-6 w-6 bg-white/80 hover:bg-white"
                       >
                         <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                       </Button>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{product.storeName}</p>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{product.price.toLocaleString()}원</p>
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 브랜드 탭 */}
          <TabsContent value="brands" className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              좋아요한 브랜드 {likedBrands.length}개
            </div>
            
            {brandsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">브랜드를 불러오는 중...</p>
              </div>
            ) : likedBrands.length === 0 ? (
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">좋아요한 브랜드가 없습니다</h3>
                <p className="text-gray-500 dark:text-gray-400">마음에 드는 브랜드에 좋아요를 눌러보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {likedBrands.map((brand) => (
                  <div key={brand.brandId} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <img 
                          src={brand.logoUrl} 
                          alt={brand.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">{brand.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{brand.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
