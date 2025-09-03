'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategorySelector } from '@/widgets/category-tabs/category-selector'
import { ProductGrid } from '@/widgets/product-grid/product-grid'
import { useCategoryProducts } from '@/shared/api/queries'

interface ProductSelectionStepProps {
  selectedProducts: string[]
  onProductSelect: (productId: string) => void
  onNext: () => void
}

export function ProductSelectionStep({ 
  selectedProducts, 
  onProductSelect, 
  onNext 
}: ProductSelectionStepProps) {
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  
  const { data: products = [], isLoading } = useCategoryProducts(selectedCategory, selectedSubCategory)

  const handleCategoryChange = (major: string, sub?: string) => {
    setSelectedCategory(major)
    setSelectedSubCategory(sub || '')
    setShowCategorySelector(false)
  }

  const getCategoryDisplayText = () => {
    if (selectedSubCategory) {
      return `${selectedCategory} > ${selectedSubCategory}`
    }
    return selectedCategory
  }

  return (
    <motion.div
      className="flex-1 flex flex-col"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 카테고리 선택 */}
      <div className="p-4 border-b">
        <Button
          variant="outline"
          onClick={() => setShowCategorySelector(true)}
          className="w-full justify-between"
        >
          <span>{getCategoryDisplayText()}</span>
          <Plus size={16} />
        </Button>
      </div>

      {/* 상품 그리드 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ProductGrid
            products={products}
            selectedProducts={selectedProducts}
            onProductSelect={onProductSelect}
            category={selectedCategory}
            subCategory={selectedSubCategory}
          />
        )}
      </div>

      {/* 다음 단계 버튼 */}
      {selectedProducts.length > 0 && (
        <motion.div
          className="p-4 border-t bg-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={onNext}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            선택한 상품으로 코디 시작 ({selectedProducts.length}개)
          </Button>
        </motion.div>
      )}

      {/* 카테고리 선택기 */}
      {showCategorySelector && (
        <CategorySelector
          onClose={() => setShowCategorySelector(false)}
          onSelect={handleCategoryChange}
        />
      )}
    </motion.div>
  )
}
