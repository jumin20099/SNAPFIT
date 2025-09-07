'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { genderCategories, majorCategories, GenderCategory, MajorCategory, SubCategory } from '@/constants/cody-categories'

interface CategoryPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedGender: string
  selectedMajorCategory: string
  selectedSubCategory: string
  onGenderSelect: (gender: string) => void
  onMajorCategorySelect: (category: string) => void
  onSubCategorySelect: (category: string) => void
  onShowAllProducts: () => void
}

export function CategoryPanel({
  isOpen,
  onClose,
  selectedGender,
  selectedMajorCategory,
  selectedSubCategory,
  onGenderSelect,
  onMajorCategorySelect,
  onSubCategorySelect,
  onShowAllProducts
}: CategoryPanelProps) {
  const [activeStep, setActiveStep] = useState<'gender' | 'major' | 'sub'>('gender')

  // 선택된 대분류의 소분류 목록 가져오기
  const currentMajorCategory = majorCategories.find(cat => cat.id === selectedMajorCategory)
  const subCategories = currentMajorCategory?.subCategories || []

  // 카테고리 선택 핸들러
  const handleGenderSelect = (gender: string) => {
    onGenderSelect(gender)
    setActiveStep('major')
  }

  const handleMajorCategorySelect = (category: string) => {
    onMajorCategorySelect(category)
    setActiveStep('sub')
  }

  const handleSubCategorySelect = (category: string) => {
    onSubCategorySelect(category)
  }

  const handleBack = () => {
    if (activeStep === 'sub') {
      setActiveStep('major')
    } else if (activeStep === 'major') {
      setActiveStep('gender')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* 카테고리 패널 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl z-50"
            style={{ height: '70vh' }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {activeStep !== 'gender' && (
                  <button
                    onClick={handleBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <ChevronDown className="w-5 h-5 rotate-90" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {activeStep === 'gender' && '성별 선택'}
                  {activeStep === 'major' && '카테고리 선택'}
                  {activeStep === 'sub' && '세부 카테고리 선택'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

            {/* 단계 표시기 */}
            <div className="flex items-center justify-center space-x-2 p-4">
              {['gender', 'major', 'sub'].map((step, index) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    (step === 'gender' && activeStep === 'gender') ||
                    (step === 'major' && activeStep === 'major') ||
                    (step === 'sub' && activeStep === 'sub')
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* 카테고리 컨텐츠 */}
            <div className="flex-1 overflow-hidden">
              {/* 성별 선택 */}
              {activeStep === 'gender' && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-4 h-full overflow-y-auto"
                >
                  <div className="space-y-2">
                    {genderCategories.map((gender) => (
                      <button
                        key={gender.id}
                        onClick={() => handleGenderSelect(gender.id)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          selectedGender === gender.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="font-medium">{gender.name}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 대분류 선택 */}
              {activeStep === 'major' && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-4 h-full overflow-y-auto"
                >
                  <div className="space-y-2">
                    {/* 전체보기 버튼 */}
                    <button
                      onClick={onShowAllProducts}
                      className="w-full p-4 text-left rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">전체보기</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">모든 상품 보기</div>
                    </button>

                    {majorCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleMajorCategorySelect(category.id)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          selectedMajorCategory === category.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {category.subCategories.length}개 세부 카테고리
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 소분류 선택 */}
              {activeStep === 'sub' && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-4 h-full overflow-y-auto"
                >
                  <div className="space-y-2">
                    {/* 전체보기 버튼 */}
                    <button
                      onClick={onShowAllProducts}
                      className="w-full p-4 text-left rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">전체보기</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {currentMajorCategory?.name} 전체 상품 보기
                      </div>
                    </button>

                    {subCategories.map((subCategory) => (
                      <button
                        key={subCategory.id}
                        onClick={() => handleSubCategorySelect(subCategory.id)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          selectedSubCategory === subCategory.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="font-medium">{subCategory.name}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 현재 선택 상태 표시 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">선택된 카테고리:</span>{' '}
                {selectedGender && (
                  <span className="text-blue-600 dark:text-blue-400">
                    {genderCategories.find(g => g.id === selectedGender)?.name}
                  </span>
                )}
                {selectedMajorCategory && (
                  <>
                    {' > '}
                    <span className="text-blue-600 dark:text-blue-400">
                      {majorCategories.find(c => c.id === selectedMajorCategory)?.name}
                    </span>
                  </>
                )}
                {selectedSubCategory && (
                  <>
                    {' > '}
                    <span className="text-blue-600 dark:text-blue-400">
                      {subCategories.find(c => c.id === selectedSubCategory)?.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
