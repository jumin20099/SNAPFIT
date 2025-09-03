'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from './ProductCard'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discountRate?: number
  imageUrl: string
  badges?: string[]
  rating?: number
  reviewCount?: number
  shipping?: string
}

interface ProductGridProps {
  category: string
  gender?: string
  mainCategory?: string
  subCategory?: string
}

// Mock 데이터 - 12개 상품
const mockProducts: Product[] = [
  {
    id: '1',
    name: '베이직 오버핏 티셔츠',
    brand: '무지',
    price: 19900,
    originalPrice: 29900,
    discountRate: 33,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
    badges: ['무료배송', '특가'],
    rating: 4.8,
    reviewCount: 1234,
    shipping: '무료배송'
  },
  {
    id: '2',
    name: '데님 스트레이트 팬츠',
    brand: '데님브랜드',
    price: 89000,
    originalPrice: 129000,
    discountRate: 31,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop',
    badges: ['무료배송'],
    rating: 4.9,
    reviewCount: 567,
    shipping: '무료배송'
  },
  {
    id: '3',
    name: '캐시미어 블렌드 니트',
    brand: '니트하우스',
    price: 159000,
    originalPrice: 199000,
    discountRate: 20,
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
    badges: ['무료배송', '쿠폰할인'],
    rating: 4.7,
    reviewCount: 890,
    shipping: '무료배송'
  },
  {
    id: '4',
    name: '슬림핏 블레이저',
    brand: '포멀웨어',
    price: 299000,
    originalPrice: 399000,
    discountRate: 25,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    badges: ['무료배송'],
    rating: 4.9,
    reviewCount: 234,
    shipping: '무료배송'
  },
  {
    id: '5',
    name: '컬러풀 후드티',
    brand: '스트리트',
    price: 69000,
    originalPrice: 99000,
    discountRate: 30,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=600&fit=crop',
    badges: ['무료배송', '특가'],
    rating: 4.6,
    reviewCount: 1456,
    shipping: '무료배송'
  },
  {
    id: '6',
    name: '프리미엄 가죽 자켓',
    brand: '레더마스터',
    price: 599000,
    originalPrice: 799000,
    discountRate: 25,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
    badges: ['무료배송'],
    rating: 4.8,
    reviewCount: 123,
    shipping: '무료배송'
  },
  {
    id: '7',
    name: '캐주얼 체크 셔츠',
    brand: '셔츠팩토리',
    price: 79000,
    originalPrice: 119000,
    discountRate: 34,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=600&fit=crop',
    badges: ['무료배송', '특가'],
    rating: 4.7,
    reviewCount: 678,
    shipping: '무료배송'
  },
  {
    id: '8',
    name: '스포츠 트랙팬츠',
    brand: '스포츠웨어',
    price: 49000,
    originalPrice: 69000,
    discountRate: 29,
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-1b8a0b5b0b0b?w=400&h=600&fit=crop',
    badges: ['무료배송'],
    rating: 4.5,
    reviewCount: 912,
    shipping: '무료배송'
  },
  {
    id: '9',
    name: '울 코트',
    brand: '코트마스터',
    price: 399000,
    originalPrice: 499000,
    discountRate: 20,
    imageUrl: 'https://images.unsplash.com/photo-1539533113200-0a0b5b0b0b0b?w=400&h=600&fit=crop',
    badges: ['무료배송', '쿠폰할인'],
    rating: 4.9,
    reviewCount: 345,
    shipping: '무료배송'
  },
  {
    id: '10',
    name: '데님 셔츠',
    brand: '데님브랜드',
    price: 89000,
    originalPrice: 129000,
    discountRate: 31,
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
    badges: ['무료배송'],
    rating: 4.6,
    reviewCount: 789,
    shipping: '무료배송'
  },
  {
    id: '11',
    name: '베이직 스웨터',
    brand: '니트하우스',
    price: 119000,
    originalPrice: 159000,
    discountRate: 25,
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
    badges: ['무료배송', '특가'],
    rating: 4.8,
    reviewCount: 456,
    shipping: '무료배송'
  },
  {
    id: '12',
    name: '캐주얼 팬츠',
    brand: '캐주얼웨어',
    price: 69000,
    originalPrice: 99000,
    discountRate: 30,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop',
    badges: ['무료배송'],
    rating: 4.7,
    reviewCount: 623,
    shipping: '무료배송'
  }
]

// 카테고리별 상품 매핑 (실제로는 API에서 가져와야 함)
const getFilteredProducts = (
  allProducts: Product[],
  gender?: string,
  mainCategory?: string,
  subCategory?: string
): Product[] => {
  let filtered = [...allProducts]

  // 성별 필터링 (실제로는 상품에 gender 필드가 있어야 함)
  if (gender && gender !== 'all') {
    // Mock: 성별에 따른 필터링 로직
    // 실제로는 상품 데이터에 gender 필드가 있어야 함
  }

  // 메인 카테고리 필터링
  if (mainCategory) {
    switch (mainCategory) {
      case 'tops':
        filtered = filtered.filter(p => 
          p.name.includes('티셔츠') || 
          p.name.includes('셔츠') || 
          p.name.includes('니트') || 
          p.name.includes('후드') ||
          p.name.includes('스웨터')
        )
        break
      case 'outerwear':
        filtered = filtered.filter(p => 
          p.name.includes('자켓') || 
          p.name.includes('코트') || 
          p.name.includes('블레이저')
        )
        break
      case 'pants':
        filtered = filtered.filter(p => 
          p.name.includes('팬츠') || 
          p.name.includes('바지')
        )
        break
      case 'shoes':
        filtered = filtered.filter(p => 
          p.name.includes('신발') || 
          p.name.includes('스니커즈')
        )
        break
      case 'bags':
        filtered = filtered.filter(p => 
          p.name.includes('가방') || 
          p.name.includes('백')
        )
        break
      case 'accessories':
        filtered = filtered.filter(p => 
          p.name.includes('액세서리') || 
          p.name.includes('소품')
        )
        break
    }
  }

  // 서브 카테고리 필터링
  if (subCategory) {
    switch (subCategory) {
      case 'sweatshirts':
        filtered = filtered.filter(p => p.name.includes('맨투맨') || p.name.includes('스웨트'))
        break
      case 'hoodies':
        filtered = filtered.filter(p => p.name.includes('후드'))
        break
      case 'shirts':
        filtered = filtered.filter(p => p.name.includes('셔츠'))
        break
      case 'knit':
        filtered = filtered.filter(p => p.name.includes('니트') || p.name.includes('스웨터'))
        break
      case 'jeans':
        filtered = filtered.filter(p => p.name.includes('데님'))
        break
      case 'leather-jacket':
        filtered = filtered.filter(p => p.name.includes('가죽'))
        break
      case 'blazer':
        filtered = filtered.filter(p => p.name.includes('블레이저'))
        break
      // 더 많은 서브 카테고리 필터링 로직 추가 가능
    }
  }

  return filtered
}

export function ProductGrid({ category, gender, mainCategory, subCategory }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    // Mock 데이터 사용 (실제 API 호출로 교체 필요)
    setTimeout(() => {
      const filteredProducts = getFilteredProducts(mockProducts, gender, mainCategory, subCategory)
      setProducts(filteredProducts)
      setIsLoading(false)
    }, 800)
  }, [category, gender, mainCategory, subCategory])

  const handleLike = (productId: string) => {
    // 찜 기능 구현
    console.log('찜한 상품:', productId)
  }

  const loadMore = () => {
    if (!hasMore) return
    
    setIsLoading(true)
    // 실제 API 호출로 교체 필요
    // 예시: fetchMoreProducts(category, products.length).then(newProducts => {
    //   setProducts(prev => [...prev, ...newProducts])
    //   setHasMore(newProducts.length > 0)
    // })
    setTimeout(() => {
      setHasMore(false) // Mock 데이터 제거로 더 이상 로드할 데이터 없음
      setIsLoading(false)
    }, 1000)
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
          <AnimatePresence mode="wait">
            {isLoading ? (
              // 로딩 스켈레톤
              Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))
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
                  className="text-purple-600 text-sm font-medium hover:underline"
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
