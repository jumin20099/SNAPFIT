'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { CATEGORIES, type GenderCategory, type MainCategory, type CategoryItem } from '@/constants/categories'

interface MainCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategorySelect: (genderId: string, mainCategoryId: string, subCategoryId?: string) => void
  selectedGender?: string
  selectedMainCategory?: string
  selectedSubCategory?: string
}

export function MainCategoryModal({
  isOpen,
  onClose,
  onCategorySelect,
  selectedGender = 'all',
  selectedMainCategory,
  selectedSubCategory
}: MainCategoryModalProps) {
  const [activeGender, setActiveGender] = useState(selectedGender)
  const [activeMainCategory, setActiveMainCategory] = useState(selectedMainCategory)
  const [activeSubCategory, setActiveSubCategory] = useState(selectedSubCategory)

  const currentGenderCategory = CATEGORIES.find(cat => cat.id === activeGender)
  const currentMainCategory = currentGenderCategory?.mainCategories.find(cat => cat.id === activeMainCategory)

  const handleGenderSelect = (genderId: string) => {
    setActiveGender(genderId)
    setActiveMainCategory(undefined)
    setActiveSubCategory(undefined)
  }

  const handleMainCategorySelect = (mainCategoryId: string) => {
    setActiveMainCategory(mainCategoryId)
    setActiveSubCategory(undefined)
    // 메인 페이지에서는 대분류 선택 시 모달 닫지 않음 (소분류 선택을 위해)
  }

  const handleSubCategorySelect = (subCategoryId: string) => {
    setActiveSubCategory(subCategoryId)
    onCategorySelect(activeGender, activeMainCategory!, subCategoryId)
    onClose() // 메인 페이지에서는 소분류 선택 시 모달 닫기
  }


  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-white dark:bg-dark-bg w-full max-w-md max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-[70vh]">
            {/* 좌측: 성별 선택 */}
            <div className="w-20 md:w-24 bg-white dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border">
              {/* 닫기 버튼 */}
              <div className="p-2 border-b border-gray-200 dark:border-dark-border">
                <button
                  onClick={onClose}
                  className="w-full p-2 hover:bg-gray-100 dark:hover:bg-dark-border angular-rounded transition-colors"
                >
                  <X size={16} className="text-gray-600 dark:text-dark-text mx-auto" />
                </button>
              </div>
              <div className="p-1 md:p-2">
                {CATEGORIES.map((gender) => (
                  <button
                    key={gender.id}
                    onClick={() => handleGenderSelect(gender.id)}
                    className={`w-full text-left p-2 md:p-3 mb-1 angular-rounded text-xs md:text-sm font-medium transition-colors ${
                      activeGender === gender.id
                        ? 'bg-gray-100 dark:bg-dark-sub text-gray-900 dark:text-dark-text shadow-sm border border-gray-200 dark:border-dark-border'
                        : 'text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                  >
                    {gender.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 중앙: 메인 카테고리 또는 서브 카테고리 */}
            <div className="flex-1 bg-white dark:bg-dark-bg min-w-0">
              {!activeMainCategory ? (
                /* 메인 카테고리 표시 */
                currentGenderCategory && (
                  <div className="p-2 md:p-4">
                    <div className="max-h-[60vh] overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1 md:gap-2 pr-2 pb-4">
                        {currentGenderCategory.mainCategories.map((mainCategory) => (
                          <button
                            key={mainCategory.id}
                            onClick={() => handleMainCategorySelect(mainCategory.id)}
                            className="flex items-center justify-between p-2 md:p-3 angular-rounded transition-colors text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border"
                          >
                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                              <span className="text-sm md:text-lg flex-shrink-0">{mainCategory.icon}</span>
                              <span className="font-medium text-sm md:text-base truncate">{mainCategory.name}</span>
                            </div>
                            <ChevronRight size={14} className="text-gray-400 dark:text-dark-text flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* 서브 카테고리 표시 */
                currentMainCategory && (
                  <div className="p-2 md:p-4">
                    {/* 서브 카테고리 헤더 */}
                    <div className="flex items-center mb-6">
                      {activeSubCategory && (
                        <button
                          onClick={() => setActiveSubCategory(undefined)}
                          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
                        >
                          <ChevronRight size={20} className="text-gray-600 dark:text-dark-text rotate-180" />
                        </button>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                          {activeSubCategory 
                            ? currentMainCategory.subCategories.find(sub => sub.id === activeSubCategory)?.name
                            : currentMainCategory.name
                          }
                        </h3>
                      </div>
                    </div>

                    {/* 서브 카테고리 그리드 */}
                    {!activeSubCategory ? (
                      <div className="max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pr-2 pb-4">
                          {currentMainCategory.subCategories.map((subCategory) => (
                            <button
                              key={subCategory.id}
                              onClick={() => handleSubCategorySelect(subCategory.id)}
                              className="p-3 md:p-4 angular-rounded text-center transition-colors bg-white dark:bg-dark-sub text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border border border-gray-100 dark:border-dark-border"
                            >
                              <div className="space-y-2 md:space-y-3">
                                {/* 아이콘 영역 */}
                                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-gray-100 dark:bg-dark-border angular-rounded flex items-center justify-center">
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
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-border rounded-full flex items-center justify-center">
                          <span className="text-2xl">✅</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text mb-1">카테고리 선택 완료</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">선택된 카테고리의 상품을 확인하세요</p>
                      </div>
                    )}
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
