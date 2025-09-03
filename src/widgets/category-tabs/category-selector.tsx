'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_MAP } from '@/constants/category-map'

interface Product {
  productIdx: number
  productName: string
  productContent: string
  productPrice: number
  productImage: string
  majorCategory: string
  subCategory: string
  storeIdx: number
  storeName?: string
}

interface CategorySelectorProps {
  onClose: () => void
  onSelect: (major: string, sub?: string) => void
  onProductSelect?: (product: Product) => void
  selectedCategory?: string
}

type SearchType = 'category' | 'product' | 'all'

const SEARCH_TYPES = [
  { value: 'category', label: '카테고리' },
  { value: 'product', label: '상품' },
  { value: 'all', label: '전체' },
] as const

export function CategorySelector({ onClose, onSelect, onProductSelect, selectedCategory }: CategorySelectorProps) {
  // 전체 카테고리에서 메이저 카테고리들을 가져옴
  const majors = Object.keys(CATEGORY_MAP.전체)
  const [activeMajor, setActiveMajor] = useState<string>(majors[0])
  const [activeSub, setActiveSub] = useState<string>('')
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showSearchType, setShowSearchType] = useState(false)
  const [showProducts, setShowProducts] = useState(false)

  // 컴포넌트가 마운트되면 기본 상품 로드
  useEffect(() => {
    loadProducts(activeMajor, '')
  }, [])

  // 카테고리 변경 시 상품 로드
  useEffect(() => {
    if (showProducts) {
      loadProducts(activeMajor, activeSub)
    }
  }, [activeMajor, activeSub, showProducts])

  // 상품 로드 함수
  const loadProducts = async (major: string, sub: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (major && major !== '전체') {
        params.append('majorCategory', major)
      }
      if (sub) {
        params.append('subCategory', sub)
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || data || [])
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('상품 로드 오류:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // 검색어에 따른 카테고리 필터링
  const getFilteredCategories = () => {
    if (!searchQuery.trim() || searchType === 'product') {
      return {
        majors: majors,
        subs: (CATEGORY_MAP.전체 as any)[activeMajor] || []
      }
    }

    const query = searchQuery.toLowerCase()
    const filteredMajors: string[] = []
    const filteredSubs: string[] = []

    // 메이저 카테고리 검색
    majors.forEach(major => {
      if (major.toLowerCase().includes(query)) {
        filteredMajors.push(major)
      }
    })

    // 서브 카테고리 검색
    majors.forEach(major => {
      const subs = (CATEGORY_MAP.전체 as any)[major] || []
      subs.forEach((sub: string) => {
        if (sub.toLowerCase().includes(query)) {
          if (!filteredMajors.includes(major)) {
            filteredMajors.push(major)
          }
          filteredSubs.push(sub)
        }
      })
    })

    return {
      majors: filteredMajors,
      subs: filteredSubs
    }
  }

  // 상품 검색 실행
  const performProductSearch = async () => {
    if (!searchQuery.trim() || searchType === 'category') {
      setProducts([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        keyword: searchQuery.trim(),
        type: 'all',
      })

      const response = await fetch(`/api/products/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('검색에 실패했습니다.')
      }

      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('검색 오류:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // 검색어 변경 시 디바운스 적용
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    
    if (query.trim()) {
      if (searchType === 'product' || searchType === 'all') {
        const timer = setTimeout(() => {
          performProductSearch()
        }, 300)
        return () => clearTimeout(timer)
      }
    } else {
      // 검색어가 없으면 현재 카테고리의 상품들 표시
      loadProducts(activeMajor, activeSub)
    }
  }

  const { majors: filteredMajors, subs: filteredSubs } = getFilteredCategories()

  const selectMajor = (m: string) => {
    setActiveMajor(m)
    setActiveSub('')
    setShowProducts(true)
    onSelect(m)
  }

  const selectSub = (s: string) => {
    setActiveSub(s)
    setShowProducts(true)
    onSelect(activeMajor, s)
  }

  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product)
  }

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode)
    if (!isSearchMode) {
      setSearchQuery('')
      setProducts([])
    }
  }

  const toggleProducts = () => {
    setShowProducts(!showProducts)
    if (!showProducts) {
      loadProducts(activeMajor, activeSub)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50">
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">카테고리 & 검색</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* 검색 입력 필드 */}
        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="카테고리 또는 상품 검색..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearchMode}
                className="p-1 h-6 w-6"
              >
                <Search className="w-4 h-4" />
              </Button>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearchChange('')}
                  className="p-1 h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 카테고리 선택 */}
        <div className="space-y-4 mb-6">
          {/* 메이저 카테고리 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">메이저 카테고리</h4>
            <div className="flex flex-wrap gap-2">
              {majors.slice(0, 6).map((major) => (
                <button
                  key={major}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-colors',
                    activeMajor === major 
                      ? 'bg-black text-white' 
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  )}
                  onClick={() => selectMajor(major)}
                >
                  {major}
                </button>
              ))}
            </div>
          </div>

          {/* 서브 카테고리 */}
          {(CATEGORY_MAP.전체 as any)[activeMajor] && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">서브 카테고리</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(CATEGORY_MAP.전체 as any)[activeMajor]?.slice(0, 8).map((sub: string) => (
                  <button
                    key={sub}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors',
                      activeSub === sub 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                    onClick={() => selectSub(sub)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 상품 목록 토글 버튼 */}
        <div className="mb-4">
          <Button
            onClick={toggleProducts}
            variant="outline"
            className="w-full"
          >
            {showProducts ? '상품 목록 숨기기' : '상품 목록 보기'}
          </Button>
        </div>

        {/* 상품 목록 */}
        {showProducts && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              상품 목록 ({products.length}개)
            </h4>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                상품을 불러오는 중...
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <Card
                    key={product.productIdx}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleProductSelect(product)}
                  >
                    <CardContent className="p-3">
                      <img
                        src={product.productImage || "/placeholder.svg"}
                        alt={product.productName}
                        className="w-full h-20 object-cover rounded mb-2 bg-gray-50"
                      />
                      <h5 className="text-xs font-medium truncate mb-1">
                        {product.productName}
                      </h5>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {product.productContent}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {product.majorCategory}
                        </Badge>
                        <span className="text-xs font-medium text-gray-900">
                          ₩{product.productPrice?.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? '검색 결과가 없습니다' : '해당 카테고리에 상품이 없습니다'}
              </div>
            )}
          </div>
        )}

        {/* 현재 선택 상태 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            현재 선택: <strong>{activeMajor}</strong>
            {activeSub && <span> - <strong>{activeSub}</strong></span>}
          </p>
          {showProducts && (
            <p className="text-xs text-blue-600 mt-1">
              상품 {products.length}개 표시 중
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
