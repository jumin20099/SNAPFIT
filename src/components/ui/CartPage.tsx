'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  productId: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discountRate?: number
  imageUrl: string
  quantity: number
  size?: string
  color?: string
  shippingInfo?: string
  isLiked?: boolean
}

interface RecentProduct {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discountRate?: number
  imageUrl: string
  shippingInfo?: string
  rating?: number
  reviewCount?: number
  badge?: string
  isLiked?: boolean
}

export function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCartData()
    loadRecentProducts()
  }, [])

  // 장바구니 데이터 로드
  const loadCartData = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
      }
    } catch (error) {
      console.error('장바구니 로드 실패:', error)
    }
  }

  // 최근 본 상품 로드
  const loadRecentProducts = async () => {
    try {
      const response = await fetch('/api/products/recent')
      if (response.ok) {
        const data = await response.json()
        setRecentProducts(data.products || [])
      }
    } catch (error) {
      console.error('최근 본 상품 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 상품 보러 가기
  const goToProducts = () => {
    router.push('/')
  }

  // 상품 상세 페이지로 이동
  const goToProduct = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  // 좋아요 토글
  const toggleLike = async (productId: string) => {
    try {
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      
      if (response.ok) {
        // 최근 본 상품 목록 업데이트
        setRecentProducts(prev => 
          prev.map(product => 
            product.id === productId 
              ? { ...product, isLiked: !product.isLiked }
              : product
          )
        )
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">장바구니</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 장바구니가 비어있을 때 */}
        {cartItems.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              장바구니에 담긴 상품이 없어요
            </h2>
            <p className="text-gray-500 mb-8">
              원하는 상품을 담아보세요
            </p>
            <button
              onClick={goToProducts}
              className="bg-gray-900 text-white px-8 py-4 angular-button font-medium hover:bg-gray-800 transition-colors"
            >
              상품 보러 가기
            </button>
          </motion.div>
        ) : (
          /* 장바구니에 상품이 있을 때 */
          <div className="space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white angular-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 angular-rounded flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover angular-rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
                        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="text-xs text-gray-500 mb-1">사이즈: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-xs text-gray-500 mb-2">색상: {item.color}</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleLike(item.productId)}
                        className="p-1 hover:bg-gray-100 angular-rounded transition-colors"
                      >
                        <Heart
                          size={16}
                          className={item.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        {item.discountRate && (
                          <span className="text-sm font-bold text-red-500">
                            {item.discountRate}%
                          </span>
                        )}
                        <span className="text-base font-bold text-gray-900">
                          {item.price.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-6 h-6 bg-gray-100 angular-rounded flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button className="w-6 h-6 bg-gray-100 angular-rounded flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 구분선 */}
        <div className="my-8 border-t border-gray-200"></div>

        {/* 최근 본 상품 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">최근 본 상품</h2>
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors angular-button px-2 py-1">
              더보기
              <ChevronRight size={16} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32">
                  <div className="animate-pulse">
                    <div className="w-32 h-40 bg-gray-200 angular-rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 angular-rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 angular-rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentProducts.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="flex-shrink-0 w-32 cursor-pointer"
                  onClick={() => goToProduct(product.id)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <div className="w-32 h-40 bg-gray-100 angular-rounded overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 뱃지 */}
                    {product.badge && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-gray-600 text-white text-xs px-2 py-1 angular-rounded">
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* 좋아요 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(product.id)
                      }}
                      className="absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center"
                    >
                      <Heart
                        size={12}
                        className={product.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                      />
                    </button>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">{product.brand}</span>
                      <span className="text-xs bg-orange-100 text-orange-600 px-1 angular-rounded">M</span>
                    </div>
                    <p className="text-xs text-gray-900 line-clamp-2 leading-tight">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1">
                      {product.discountRate && (
                        <span className="text-xs font-bold text-red-500">
                          {product.discountRate}%
                        </span>
                      )}
                      <span className="text-sm font-bold text-gray-900">
                        {product.price.toLocaleString()}~
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{product.shippingInfo}</p>
                    {product.rating && (
                      <p className="text-xs text-gray-500">
                        ★{product.rating}({product.reviewCount})
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">최근 본 상품이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
