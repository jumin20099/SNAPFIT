'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, ArrowLeft, Filter, Grid, List } from 'lucide-react'
import { Product } from '@/shared/types'
import { ProductCard } from '@/components/ui/ProductCard'
import { StickyHeader } from '@/components/ui/StickyHeader'
import { useBatchReactionStatus } from '@/shared/hooks/useBatchReactionStatus'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'name' | 'createdAt'>('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // 상품 검색 - Next.js API 라우트 사용
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 통합 배치 상태 조회
  const productIds = products.map(p => parseInt(p.id)).filter(id => !isNaN(id))
  const { data: reactionStatus, manager: reactionManager } = useBatchReactionStatus({
    productIds,
    enabled: products.length > 0
  })

  useEffect(() => {
    if (!query.trim()) return

    const searchProducts = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error('검색에 실패했습니다.')
        }
        
        const data = await response.json()
        const productsWithStatus = (data.products || []).map((product: Product) => {
          const status = reactionManager.getProductStatus(product.id)
          return {
            ...product,
            isLiked: status?.liked || false,
            likeCount: status?.likeCount || 0
          }
        })
        setProducts(productsWithStatus)
      } catch (err) {
        console.error('검색 오류:', err)
        setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    searchProducts()
  }, [query])

  // 반응 상태가 변경될 때 상품 목록 업데이트
  useEffect(() => {
    if (reactionStatus && products.length > 0) {
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const status = reactionManager.getProductStatus(product.id)
          if (status) {
            return {
              ...product,
              isLiked: status.liked || false,
              likeCount: status.likeCount || 0
            }
          }
          return product
        })
      )
    }
  }, [reactionStatus])

  // 정렬 옵션 변경 감지
  useEffect(() => {
    console.log('정렬 옵션 변경:', { sortBy, sortOrder })
  }, [sortBy, sortOrder])

  // 정렬된 상품 목록
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        const priceA = a.price || a.productPrice || a.product_price || 0
        const priceB = b.price || b.productPrice || b.product_price || 0
        console.log(`가격 정렬: ${priceA} vs ${priceB}, 순서: ${sortOrder}`)
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
      case 'name':
        const nameA = a.productName || a.name || a.product_name || ''
        const nameB = b.productName || b.name || b.product_name || ''
        console.log(`이름 정렬: ${nameA} vs ${nameB}, 순서: ${sortOrder}`)
        return sortOrder === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA)
      case 'createdAt':
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime()
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime()
        console.log(`날짜 정렬: ${dateA} vs ${dateB}, 순서: ${sortOrder}`)
        return sortOrder === 'asc' 
          ? dateA - dateB
          : dateB - dateA
      default:
        console.log('관련성 순 정렬')
        return 0 // 관련성 순 (기본값)
    }
  })

  const handleProductClick = (product: Product) => {
    const productId = product.id || product.productIdx || product.product_id || product.product_idx
    console.log('상품 ID 필드들:', {
      id: product.id,
      productIdx: product.productIdx,
      product_id: product.product_id,
      product_idx: product.product_idx,
      최종_ID: productId
    })
    if (productId) {
      router.push(`/products/${productId}`)
    } else {
      console.error('상품 ID를 찾을 수 없습니다:', product)
    }
  }

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* 고정 헤더 */}
      <StickyHeader />

      {/* 검색 헤더 */}
      <div className="sticky top-16 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-dark-text" />
            </button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                readOnly
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-border border-0 rounded-2xl text-gray-900 dark:text-dark-text"
                placeholder="검색어를 입력하세요"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="max-w-md mx-auto px-4 py-4">
        {/* 검색 결과 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
              검색 결과
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              "{query}"에 대한 {products.length}개의 상품
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 정렬 옵션 */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
              className="text-sm border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-bg text-gray-700 dark:text-dark-text"
            >
              <option value="relevance-desc">관련성순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="price-desc">가격 높은순</option>
              <option value="name-asc">이름순</option>
              <option value="createdAt-desc">최신순</option>
            </select>
            
            {/* 뷰 모드 */}
            <div className="flex border border-gray-300 dark:border-dark-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-dark-border' : 'hover:bg-gray-50 dark:hover:bg-dark-bg'}`}
              >
                <Grid size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-dark-border' : 'hover:bg-gray-50 dark:hover:bg-dark-bg'}`}
              >
                <List size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">검색 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">검색 중 오류가 발생했습니다.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-8">
            <Search size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              다른 검색어로 시도해보세요
            </p>
            <button
              onClick={handleBackClick}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
            >
              다시 검색하기
            </button>
          </div>
        )}

        {/* 상품 목록 */}
        {!isLoading && !error && products.length > 0 && (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-2 gap-3' 
              : 'space-y-3'
          }`}>
            {sortedProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-${index}`}
                product={product}
                onClick={() => handleProductClick(product)}
                variant={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
