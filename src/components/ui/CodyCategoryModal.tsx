'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Plus, Heart } from 'lucide-react'
import { CATEGORIES, type GenderCategory, type MainCategory, type CategoryItem } from '@/constants/categories'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCategoryProducts } from '@/shared/api/queries'

interface CodyCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategorySelect: (genderId: string, mainCategoryId: string, subCategoryId?: string) => void
  selectedGender?: string
  selectedMainCategory?: string
  selectedSubCategory?: string
  onProductAdd?: (product: any) => void
}

export function CodyCategoryModal({
  isOpen,
  onClose,
  onCategorySelect,
  selectedGender = 'all',
  selectedMainCategory,
  selectedSubCategory,
  onProductAdd
}: CodyCategoryModalProps) {
  const [activeGender, setActiveGender] = useState(selectedGender)
  const [activeMainCategory, setActiveMainCategory] = useState(selectedMainCategory)
  const [activeSubCategory, setActiveSubCategory] = useState(selectedSubCategory)

  const currentGenderCategory = CATEGORIES.find(cat => cat.id === activeGender)
  const currentMainCategory = currentGenderCategory?.mainCategories.find(cat => cat.id === activeMainCategory)

  // 실제 API에서 상품 데이터 가져오기
  const getMainCategoryName = (mainCategoryId: string | undefined) => {
    if (!mainCategoryId || !currentGenderCategory) return undefined
    const mainCategory = currentGenderCategory.mainCategories.find(main => main.id === mainCategoryId)
    return mainCategory?.name
  }

  const getSubCategoryName = (subCategoryId: string | undefined) => {
    if (!subCategoryId || !currentMainCategory) return undefined
    const subCategory = currentMainCategory.subCategories.find(sub => sub.id === subCategoryId)
    return subCategory?.name
  }

  const majorCategoryName = getMainCategoryName(activeMainCategory) || ''
  const subCategoryName = getSubCategoryName(activeSubCategory)

  const { data: products = [], isLoading, error } = useCategoryProducts(
    majorCategoryName, 
    subCategoryName
  )

  // 필터링된 상품 목록 (성별 필터링만 추가)
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return []
    
    return products.filter(product => {
      // 성별 필터링
      if (activeGender === 'male' && product.gender !== 'male') return false
      if (activeGender === 'female' && product.gender !== 'female') return false
      return true
    })
  }, [products, activeGender])

  const handleGenderSelect = (genderId: string) => {
    setActiveGender(genderId)
    setActiveMainCategory(undefined)
    setActiveSubCategory(undefined)
  }

  const handleMainCategorySelect = (mainCategoryId: string) => {
    setActiveMainCategory(mainCategoryId)
    setActiveSubCategory(undefined)
  }

  const handleSubCategorySelect = (subCategoryId: string) => {
    setActiveSubCategory(subCategoryId)
    onCategorySelect(activeGender, activeMainCategory!, subCategoryId)
    // 코디 페이지에서는 소분류 선택 시 모달 유지 (상품 표시)
  }


  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-white dark:bg-dark-bg w-full max-h-[60vh] angular-rounded-t-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-[60vh]">
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
                    <div className="grid grid-cols-1 gap-1 md:gap-2">
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

                    {/* 서브 카테고리 그리드 또는 상품 표시 영역 */}
                    {!activeSubCategory ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                    ) : (
                      /* 상품 표시 영역 - 소분류 선택 후 */
                      <div className="space-y-4">
                        {/* 상품 개수 및 상태 표시 */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-700 dark:text-dark-text">
                            {filteredProducts.length}개 상품
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {currentMainCategory.subCategories.find(sub => sub.id === activeSubCategory)?.name}
                          </div>
                        </div>
                        
                        {isLoading ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-border rounded-full flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-dark-text"></div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text mb-1">상품을 불러오는 중...</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">잠시만 기다려주세요</p>
                          </div>
                        ) : error ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                              <span className="text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text mb-1">상품을 불러올 수 없습니다</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">잠시 후 다시 시도해주세요</p>
                          </div>
                        ) : filteredProducts.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-0 max-h-80 overflow-y-auto">
                            {filteredProducts.map((product) => (
                              <Card key={product.id} className="group bg-white dark:bg-dark-sub hover:shadow-md dark:hover:shadow-lg transition-all duration-200 overflow-hidden border-0 rounded-none">
                                <CardContent className="p-0 relative">
                                  {/* 좋아요 버튼 - 우상단 */}
                                  <button className="absolute top-2 right-2 z-10 p-1 hover:bg-white/80 dark:hover:bg-dark-border/80 rounded-full transition-colors">
                                    <Heart className="h-4 w-4 text-gray-600 dark:text-dark-text hover:text-red-500" />
                                  </button>
                                  
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={product.imageUrl || product.src || "/placeholder-product.png"} 
                                    alt={product.name} 
                                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200" 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "/placeholder-product.png";
                                    }}
                                  />
                                </CardContent>
                                <div className="p-2 space-y-1">
                                  <div className="space-y-0.5">
                                    <h4 className="text-xs font-medium text-gray-900 dark:text-dark-text truncate">{product.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.price?.toLocaleString()}원</p>
                                  </div>
                                  {onProductAdd && (
                                    <Button 
                                      size="sm" 
                                      className="w-full h-6 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors" 
                                      onClick={() => onProductAdd(product)}
                                    >
                                      <Plus className="h-3 w-3 mr-1"/>
                                      추가
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-border rounded-full flex items-center justify-center">
                              <span className="text-2xl">📦</span>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text mb-1">상품이 없습니다</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">다른 카테고리를 선택해보세요</p>
                          </div>
                        )}
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
