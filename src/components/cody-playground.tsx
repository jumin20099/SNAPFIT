'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategorySelector } from './category-selector'
import { ProductGrid } from './product-grid'
import { useProductStore } from '@/stores/product-store'

const steps = ['상품 선택', '코디 구성', '완성']

export function CodyPlayground() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { products, fetchProducts } = useProductStore()
  
  const initialProductId = searchParams.get('pid')

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    if (initialProductId) {
      setSelectedProducts([initialProductId])
      setCurrentStep(1)
    }
  }, [initialProductId])

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleCategoryChange = (major: string, sub?: string) => {
    setSelectedCategory(major)
    setSelectedSubCategory(sub || '')
    setShowCategorySelector(false)
  }

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))

  // 카테고리 표시 텍스트
  const getCategoryDisplayText = () => {
    if (selectedCategory === '전체') return '전체'
    if (selectedSubCategory) return `${selectedCategory} > ${selectedSubCategory}`
    return selectedCategory
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* 상단 바 */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    index <= currentStep
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
                {index < steps.length - 1 && (
                  <div className="w-4 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2" />
                )}
              </div>
            ))}
          </div>
          
          <div className="w-10" /> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        {/* 단계별 컨텐츠 */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                코디할 상품을 선택해주세요
              </h2>
              
              {/* 카테고리 선택 */}
              <div className="mb-6">
                <Button
                  onClick={() => setShowCategorySelector(true)}
                  variant="outline"
                  className="w-full justify-between py-4 text-left"
                >
                  <span>카테고리 선택</span>
                  <span className="text-gray-500">
                    {getCategoryDisplayText()}
                  </span>
                </Button>
              </div>

              {/* 상품 그리드 */}
              <ProductGrid
                products={products}
                selectedProducts={selectedProducts}
                onProductSelect={handleProductSelect}
                category={selectedCategory}
                subCategory={selectedSubCategory}
              />

              {/* 다음 단계 버튼 */}
              {selectedProducts.length > 0 && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    onClick={() => setCurrentStep(1)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
                    size="lg"
                  >
                    선택 완료 ({selectedProducts.length}개)
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                선택된 상품
              </h2>
              
              {/* 선택된 상품 목록 */}
              <div className="space-y-4 mb-6">
                {selectedProductsData.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.brand}
                      </p>
                    </div>
                    <button
                      onClick={() => handleProductSelect(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* 코디 캔버스 placeholder */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">👕</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    코디 캔버스
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    선택된 상품들이 여기에 표시됩니다
                  </p>
                </div>
              </div>

              {/* 단계 이동 버튼 */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(0)}
                  variant="outline"
                  className="flex-1 py-4"
                >
                  이전
                </Button>
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  다음
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                코디 완성!
              </h2>
              
              <div className="text-center py-12">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  멋진 코디가 완성되었습니다
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  선택한 {selectedProducts.length}개의 상품으로 완벽한 스타일을 만들어보세요
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/')}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    홈으로 돌아가기
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(0)}
                    variant="outline"
                    className="w-full py-4"
                  >
                    새로운 코디 만들기
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 카테고리 선택기 */}
      {showCategorySelector && (
        <CategorySelector
          onClose={() => setShowCategorySelector(false)}
          onSelect={handleCategoryChange}
          selectedCategory={selectedCategory}
        />
      )}
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
