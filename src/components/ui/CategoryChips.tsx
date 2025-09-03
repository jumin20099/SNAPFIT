'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Grid3X3, ChevronDown } from 'lucide-react'
import { CategoryModal } from './CategoryModal'
import { getSelectedCategoryPath } from '@/constants/categories'

interface CategoryChipsProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedGender?: string
  selectedMainCategory?: string
  selectedSubCategory?: string
  onCategorySelect: (genderId: string, mainCategoryId: string, subCategoryId?: string) => void
}

export function CategoryChips({ 
  selectedCategory, 
  onCategoryChange,
  selectedGender,
  selectedMainCategory,
  selectedSubCategory,
  onCategorySelect
}: CategoryChipsProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const handleCategorySelect = (genderId: string, mainCategoryId: string, subCategoryId?: string) => {
    onCategorySelect(genderId, mainCategoryId, subCategoryId)
    // 선택된 카테고리 경로를 표시용으로 설정
    const categoryPath = getSelectedCategoryPath(genderId, mainCategoryId, subCategoryId)
    onCategoryChange(categoryPath || '전체')
  }

  const displayText = selectedMainCategory && selectedGender 
    ? getSelectedCategoryPath(selectedGender, selectedMainCategory, selectedSubCategory)
    : selectedCategory

  return (
    <>
      <div className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <motion.button
            onClick={() => setIsCategoryModalOpen(true)}
            className="w-full flex items-center justify-between p-4 bg-white angular-card border border-gray-200 hover:border-gray-300 transition-colors"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 angular-rounded flex items-center justify-center">
                <Grid3X3 size={20} className="text-gray-600" />
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500">카테고리</div>
                <div className="text-base font-medium text-gray-900">
                  {displayText}
                </div>
              </div>
            </div>
            <ChevronDown size={20} className="text-gray-400" />
          </motion.button>
        </div>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategorySelect={handleCategorySelect}
        selectedGender={selectedGender}
        selectedMainCategory={selectedMainCategory}
        selectedSubCategory={selectedSubCategory}
      />
    </>
  )
}
