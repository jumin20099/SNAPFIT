'use client'

import { useState } from 'react'
import { Grid3X3 } from 'lucide-react'
import { CodyCategoryModal } from './CodyCategoryModal'
import { getSelectedCategoryPath } from '@/constants/categories'

interface CodyCategoryChipsProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedGender?: string
  selectedMainCategory?: string
  selectedSubCategory?: string
  onCategorySelect: (genderId: string, mainCategoryId: string, subCategoryId?: string) => void
  onProductAdd?: (product: any) => void
  isCategoryModalOpen?: boolean
  setIsCategoryModalOpen?: (open: boolean) => void
}

export function CodyCategoryChips({ 
  selectedCategory, 
  onCategoryChange,
  selectedGender,
  selectedMainCategory,
  selectedSubCategory,
  onCategorySelect,
  onProductAdd,
  isCategoryModalOpen: externalIsOpen,
  setIsCategoryModalOpen: externalSetIsOpen
}: CodyCategoryChipsProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  // 외부에서 상태를 관리하는 경우 외부 상태를 사용, 그렇지 않으면 내부 상태 사용
  const isCategoryModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsCategoryModalOpen = externalSetIsOpen || setInternalIsOpen

  const handleCategorySelect = (genderId: string, mainCategoryId: string, subCategoryId?: string) => {
    onCategorySelect(genderId, mainCategoryId, subCategoryId)
    // 선택된 카테고리 경로를 표시용으로 설정
    const categoryPath = getSelectedCategoryPath(genderId, mainCategoryId, subCategoryId)
    onCategoryChange(categoryPath || '전체')
  }


  return (
    <>
      <button
        onClick={() => setIsCategoryModalOpen(true)}
        className="flex items-center justify-center w-12 h-12 bg-white/90 dark:bg-dark-sub/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-dark-border hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Grid3X3 size={20} className="text-gray-600 dark:text-dark-text" />
      </button>

      <CodyCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategorySelect={handleCategorySelect}
        selectedGender={selectedGender}
        selectedMainCategory={selectedMainCategory}
        selectedSubCategory={selectedSubCategory}
        onProductAdd={onProductAdd}
      />
    </>
  )
}
