'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Heart, ShoppingBag } from 'lucide-react'
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll'
import { LikeButton } from '@/features/reactions/LikeButton'

interface Product {
  productIdx: number
  productName: string
  productContent: string
  productPrice: number
  productImage: string
  majorCategory: string
  subCategory: string
  storeIdx: number
  storeName: string
  isLiked: boolean
  likeCount: number
}

interface CodyProductGridProps {
  selectedGender: string
  selectedMajorCategory: string
  selectedSubCategory: string
  onProductSelect: (product: Product) => void
  className?: string
}

export function CodyProductGrid({
  selectedGender,
  selectedMajorCategory,
  selectedSubCategory,
  onProductSelect,
  className = ''
}: CodyProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  // 상품 데이터 가져오기
  const fetchProducts = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        size: '20'
      })

      // 카테고리 필터 추가
      if (selectedGender && selectedGender !== 'all') {
        params.append('gender', selectedGender)
      }
      if (selectedMajorCategory) {
        params.append('major', selectedMajorCategory)
      }
      if (selectedSubCategory) {
        params.append('sub', selectedSubCategory)
      }

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      const newProducts = data.content || []

      setProducts(prev => reset ? newProducts : [...prev, ...newProducts])
      setHasMore(!data.last)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedGender, selectedMajorCategory, selectedSubCategory, loading])

  // 카테고리 변경 시 상품 목록 초기화
  useEffect(() => {
    setProducts([])
    setPage(0)
    setHasMore(true)
    fetchProducts(0, true)
  }, [selectedGender, selectedMajorCategory, selectedSubCategory])

  // 무한 스크롤 설정
  const { lastElementRef } = useInfiniteScroll({
    hasNextPage: hasMore,
    isFetchingNextPage: loading,
    fetchNextPage: () => fetchProducts(page + 1)
  })

  // 상품 선택 핸들러
  const handleProductSelect = (product: Product) => {
    onProductSelect(product)
  }

  // 좋아요 토글 (이제 LikeButton에서 처리하므로 제거)

  if (loading && products.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (products.length === 0 && !loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 text-gray-500 ${className}`}>
        <ShoppingBag className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-medium">상품이 없습니다</p>
        <p className="text-sm">다른 카테고리를 선택해보세요</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 상품 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product.productIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* 상품 이미지 */}
            <div className="relative aspect-square">
              <img
                src={product.productImage}
                alt={product.productName}
                className="w-full h-full object-cover"
              />
              
              {/* 좋아요 버튼 */}
              <LikeButton
                targetIdx={product.productIdx}
                targetType="product"
                initialActive={product.isLiked}
                initialCount={product.likeCount}
                className="absolute top-2 right-2 p-2 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
              />

              {/* 코디하기 버튼 */}
              <button
                onClick={() => handleProductSelect(product)}
                className="absolute bottom-2 left-2 right-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                코디하기
              </button>
            </div>

            {/* 상품 정보 */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-1">
                {product.productName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {product.storeName}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  ₩{product.productPrice.toLocaleString()}
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  <span>{product.likeCount}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 무한 스크롤 로딩 */}
      {loading && products.length > 0 && (
        <div ref={lastElementRef} className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      {/* 더 이상 로드할 상품이 없을 때 */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>모든 상품을 불러왔습니다</p>
        </div>
      )}
    </div>
  )
}
