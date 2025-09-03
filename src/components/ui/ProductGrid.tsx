'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from './ProductCard'
import { useCategoryProducts } from '@/shared/api/queries'
import type { Product } from '@/shared/types'

interface ProductGridProps {
  category: string
  gender?: string
  mainCategory?: string
  subCategory?: string
}

// API Product를 UI Product로 변환하는 함수
const transformApiProduct = (apiProduct: Product): Product => {
  return {
    id: apiProduct.productIdx?.toString() || apiProduct.id || '',
    name: apiProduct.productName || apiProduct.name || '',
    brand: apiProduct.storeName || apiProduct.brand || '',
    price: apiProduct.productPrice || apiProduct.price || 0,
    imageUrl: apiProduct.productImage || apiProduct.imageUrl || '',
    category: apiProduct.majorCategory || apiProduct.category || '',
    tags: apiProduct.tags || []
  }
}

export function ProductGrid({ category, gender, mainCategory, subCategory }: ProductGridProps) {
  // 실제 API 호출
  const { data: apiProducts, isLoading, error } = useCategoryProducts(
    mainCategory || 'all',
    subCategory
  )

  // API 데이터를 UI 형태로 변환
  const products = apiProducts ? apiProducts.map(transformApiProduct) : []
  const hasMore = false // 현재는 페이지네이션 미구현

  const handleLike = (productId: string) => {
    // 찜 기능 구현
    console.log('찜한 상품:', productId)
  }

  const loadMore = () => {
    // 페이지네이션 구현 예정
    console.log('더 많은 상품 로드')
  }

  // 스켈레톤 카드
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  )

  return (
    <div className="px-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* 섹션 타이틀 */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            당신을 위한 추천 아이템
          </h2>
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {isLoading ? (
              // 로딩 스켈레톤
              Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))
            ) : error ? (
              // 에러 상태
              <motion.div
                className="col-span-2 text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-gray-500 text-lg mb-2">
                  상품을 불러오는 중 오류가 발생했습니다
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-gray-600 text-sm font-medium hover:underline"
                >
                  다시 시도
                </button>
              </motion.div>
            ) : products.length > 0 ? (
              // 실제 상품 카드들
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    onLike={handleLike}
                  />
                </motion.div>
              ))
            ) : (
              // 빈 상태
              <motion.div
                className="col-span-2 text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-gray-500 text-lg mb-2">
                  {category === '전체' ? '추천 상품이 없습니다' : `${category} 상품이 없습니다`}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-gray-600 text-sm font-medium hover:underline"
                >
                  새로고침
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 더보기 버튼 */}
        {!isLoading && hasMore && products.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-medium transition-colors"
            >
              더 많은 상품 보기
            </button>
          </div>
        )}

        {/* 더 이상 상품이 없을 때 */}
        {!hasMore && products.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">더 이상 상품이 없어요</p>
          </div>
        )}
      </div>
    </div>
  )
}
