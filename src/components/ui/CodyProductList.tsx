'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlacedItem } from '@/entities/cody/model'
import { useRouter } from 'next/navigation'

interface ProductInfo {
  id: string
  name: string
  image: string
  price?: number
  brand?: string
  category?: string
}

interface CodyProductListProps {
  items: PlacedItem[]
  className?: string
  showScrollButtons?: boolean
}

export function CodyProductList({ 
  items, 
  className = '',
  showScrollButtons = true 
}: CodyProductListProps) {
  const router = useRouter()
  const [productInfos, setProductInfos] = useState<ProductInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // items 배열 메모이제이션
  const memoizedItems = useMemo(() => items, [items])

  // 상품 정보 가져오기
  useEffect(() => {
    const fetchProductInfos = async () => {
      setLoading(true)
      
      // 병렬로 상품 정보 조회
      const productPromises = memoizedItems.map(async (item) => {
        try {
          // productId가 있으면 API 호출, 아니면 기본 정보 사용
          // temp-로 시작하는 임시 ID는 API 호출하지 않음
          if (item.productId && item.productId > 0 && !item.id.startsWith('temp-') && item.id !== '0') {
            const response = await fetch(`/api/products/${item.productId}`)
            if (response.ok) {
              const data = await response.json()
              // ProductDetailDto인 경우 product 필드에서 실제 상품 정보 추출
              const product = data.product || data
              
              // 브랜드 정보 조회 (storeIdx가 있는 경우)
              let brandName = ''
              if (product.storeIdx) {
                try {
                  const storeResponse = await fetch(`/api/admin/store-malls/${product.storeIdx}`)
                  if (storeResponse.ok) {
                    const store = await storeResponse.json()
                    brandName = store.storeName || ''
                  }
                } catch (storeError) {
              console.warn(`스토어 정보 조회 실패 (productId: ${item.productId})`, storeError)
                }
              }
              
              return {
                id: item.itemId || item.productId?.toString(),
                name: product.productName || product.name || '',
                image: product.productImage || item.src,
                price: product.productPrice,
                brand: brandName,
                category: product.majorCategory || product.productCategory || product.category || undefined
              }
            } else {
              // API 실패 시 기본 정보 사용
              return {
                id: item.id,
                name: item.name || '상품 정보 없음',
                image: item.src,
                category: item.slot || 'accessory'
              }
            }
          } else {
            // productId가 없거나 0인 경우 기본 정보 사용
            return {
              id: item.id,
              name: item.name || '상품 정보 없음',
              image: item.src,
              category: item.slot || 'accessory'
            }
          }
        } catch (error) {
          console.error(`상품 ${item.id} 정보 가져오기 실패:`, error)
          // 에러 시에도 기본 정보는 표시
          return {
            id: item.id,
            name: item.name || '상품 정보 없음',
            image: item.src,
            category: item.slot || 'accessory'
          }
        }
      })
      
      try {
        const infos = await Promise.all(productPromises)
        setProductInfos(infos)
      } catch (error) {
        console.error('상품 정보 조회 중 오류:', error)
        setProductInfos([])
      } finally {
        setLoading(false)
      }
    }

    if (memoizedItems.length > 0) {
      fetchProductInfos()
    }
  }, [memoizedItems])

  // 스크롤 가능 여부 업데이트
  useEffect(() => {
    const container = document.getElementById('product-scroll-container')
    if (container) {
      const updateScrollButtons = () => {
        setCanScrollLeft(scrollPosition > 0)
        setCanScrollRight(scrollPosition < container.scrollWidth - container.clientWidth)
      }
      
      updateScrollButtons()
      container.addEventListener('scroll', updateScrollButtons)
      return () => container.removeEventListener('scroll', updateScrollButtons)
    }
  }, [scrollPosition, productInfos])

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('product-scroll-container')
    if (container) {
      const scrollAmount = 200
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount)
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  if (productInfos.length === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* 스크롤 버튼들 */}
      {showScrollButtons && (
        <>
          <Button
            variant="outline"
            size="sm"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md ${
              !canScrollLeft ? 'opacity-0 pointer-events-none' : ''
            }`}
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md ${
              !canScrollRight ? 'opacity-0 pointer-events-none' : ''
            }`}
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* 상품 리스트 */}
      <div
        id="product-scroll-container"
        className="flex gap-3 overflow-x-auto scrollbar-hide py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {productInfos.map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-24 text-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleProductClick(product.id)}
          >
            {/* 상품 이미지 */}
            <div className="relative w-20 h-20 mx-auto mb-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-product.png'
                }}
              />
            </div>
            
            {/* 상품 정보 */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                {product.name}
              </h4>
              {product.brand && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.brand}
                </p>
              )}
              {product.price && (
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  ₩{product.price.toLocaleString()}
                </p>
              )}
              {product.category && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {product.category}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
