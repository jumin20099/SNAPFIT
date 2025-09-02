'use client'

import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Product } from '@/stores/product-store'

interface ProductGridProps {
  products: Product[]
  selectedProducts: string[]
  onProductSelect: (productId: string) => void
  category: string
  subCategory?: string
}

export function ProductGrid({ products, selectedProducts, onProductSelect, category, subCategory }: ProductGridProps) {
  // 카테고리 필터링 로직
  const getFilteredProducts = () => {
    if (category === '전체') return products
    
    return products.filter(product => {
      const matchesCategory = product.category === category
      if (subCategory) {
        return matchesCategory && product.tags.some(tag => tag.includes(subCategory))
      }
      return matchesCategory
    })
  }

  const filteredProducts = getFilteredProducts()

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
          {category === '전체' ? '표시할 상품이 없습니다' : `해당 카테고리의 상품이 없습니다`}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          {category === '전체' ? '상품을 추가해주세요' : '다른 카테고리를 선택해보세요'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {filteredProducts.map((product, index) => {
        const isSelected = selectedProducts.includes(product.id)
        
        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group cursor-pointer"
          >
            <div className={cn(
              'bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border-2',
              isSelected 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-transparent'
            )}>
              {/* 이미지 영역 */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
                
                {/* 선택 표시 */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* 카테고리 태그 */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-lg backdrop-blur-sm">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* 상품 정보 */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {product.brand}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ₩{product.price.toLocaleString()}
                  </p>
                </div>

                {/* 태그 */}
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 선택/해제 버튼 */}
                <Button
                  onClick={() => onProductSelect(product.id)}
                  variant={isSelected ? "destructive" : "default"}
                  className={cn(
                    "w-full font-medium rounded-xl py-3 transition-all duration-200",
                    isSelected 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                  size="lg"
                >
                  {isSelected ? (
                    <>
                      <X size={18} className="mr-2" />
                      선택 해제
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="mr-2" />
                      선택하기
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// 아이콘 컴포넌트들
const X = ({ size, className }: { size: number; className?: string }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const Plus = ({ size, className }: { size: number; className?: string }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)
