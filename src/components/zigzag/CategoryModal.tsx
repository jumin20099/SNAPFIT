'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { CATEGORIES, type GenderCategory, type MainCategory, type CategoryItem } from '@/constants/categories'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategorySelect: (genderId: string, mainCategoryId: string, subCategoryId?: string) => void
  selectedGender?: string
  selectedMainCategory?: string
  selectedSubCategory?: string
}

export function CategoryModal({
  isOpen,
  onClose,
  onCategorySelect,
  selectedGender = 'all',
  selectedMainCategory,
  selectedSubCategory
}: CategoryModalProps) {
  const [activeGender, setActiveGender] = useState(selectedGender)
  const [activeMainCategory, setActiveMainCategory] = useState(selectedMainCategory)

  const currentGenderCategory = CATEGORIES.find(cat => cat.id === activeGender)
  const currentMainCategory = currentGenderCategory?.mainCategories.find(cat => cat.id === activeMainCategory)

  const handleGenderSelect = (genderId: string) => {
    setActiveGender(genderId)
    setActiveMainCategory(undefined)
  }

  const handleMainCategorySelect = (mainCategoryId: string) => {
    setActiveMainCategory(mainCategoryId)
  }

  const handleSubCategorySelect = (subCategoryId: string) => {
    onCategorySelect(activeGender, activeMainCategory!, subCategoryId)
    onClose()
  }

  const handleMainCategoryClick = (mainCategoryId: string) => {
    // 메인 카테고리만 선택하고 모달 닫기
    onCategorySelect(activeGender, mainCategoryId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-white w-full max-h-[80vh] angular-rounded-t-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 angular-rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">카테고리</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 angular-rounded transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(80vh-80px)]">
            {/* 좌측: 성별 선택 - 모바일에서 더 좁게 */}
            <div className="w-20 md:w-24 bg-gray-50 border-r border-gray-200">
              <div className="p-1 md:p-2">
                {CATEGORIES.map((gender) => (
                  <button
                    key={gender.id}
                    onClick={() => handleGenderSelect(gender.id)}
                    className={`w-full text-left p-2 md:p-3 mb-1 angular-rounded text-xs md:text-sm font-medium transition-colors ${
                      activeGender === gender.id
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {gender.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 중앙: 메인 카테고리 또는 서브 카테고리 */}
            <div className="flex-1 bg-white min-w-0">
              {!activeMainCategory ? (
                /* 메인 카테고리 표시 */
                currentGenderCategory && (
                  <div className="p-2 md:p-4">
                    <div className="grid grid-cols-1 gap-1 md:gap-2">
                      {currentGenderCategory.mainCategories.map((mainCategory) => (
                        <button
                          key={mainCategory.id}
                          onClick={() => handleMainCategorySelect(mainCategory.id)}
                          className="flex items-center justify-between p-2 md:p-3 angular-rounded transition-colors text-gray-700 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <span className="text-sm md:text-lg flex-shrink-0">{mainCategory.icon}</span>
                            <span className="font-medium text-sm md:text-base truncate">{mainCategory.name}</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                /* 서브 카테고리 표시 */
                currentMainCategory && (
                  <div className="p-2 md:p-4">
                    {/* 서브 카테고리 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActiveMainCategory(undefined)}
                          className="p-1 hover:bg-gray-100 angular-rounded"
                        >
                          <ChevronRight size={20} className="text-gray-600 rotate-180" />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {currentMainCategory.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleMainCategoryClick(currentMainCategory.id)}
                        className="text-sm text-gray-500 hover:text-gray-700 angular-button px-3 py-1"
                      >
                        전체 보기
                      </button>
                    </div>

                    {/* 서브 카테고리 그리드 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {currentMainCategory.subCategories.map((subCategory) => (
                        <button
                          key={subCategory.id}
                          onClick={() => handleSubCategorySelect(subCategory.id)}
                          className={`p-3 md:p-4 angular-rounded text-center transition-colors ${
                            selectedSubCategory === subCategory.id
                              ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <div className="space-y-2 md:space-y-3">
                            {/* 아이콘 영역 */}
                            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-gray-100 angular-rounded flex items-center justify-center">
                              <span className="text-lg md:text-2xl">
                                {subCategory.isNew ? '🆕' : currentMainCategory.icon}
                              </span>
                            </div>
                            <div className="text-xs md:text-sm font-medium leading-tight">
                              {subCategory.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>


        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
