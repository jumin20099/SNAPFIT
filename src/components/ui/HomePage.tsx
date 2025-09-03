'use client'

import { useState } from 'react'

import { StickyHeader } from './StickyHeader'
import { HeroBanner } from './HeroBanner'
import { CategoryChips } from './CategoryChips'
import { ProductGrid } from './ProductGrid'
import { BottomTabBar } from './BottomTabBar'

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedGender, setSelectedGender] = useState<string>('all')
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>()
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>()
  const [activeTab, setActiveTab] = useState('home')

  const handleCategorySelect = (genderId: string, mainCategoryId: string, subCategoryId?: string) => {
    setSelectedGender(genderId)
    setSelectedMainCategory(mainCategoryId)
    setSelectedSubCategory(subCategoryId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 고정 헤더 */}
      <StickyHeader />

      {/* 히어로 배너 */}
      <HeroBanner />

      {/* 카테고리 선택 버튼 */}
      <CategoryChips
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedGender={selectedGender}
        selectedMainCategory={selectedMainCategory}
        selectedSubCategory={selectedSubCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* 상품 그리드 */}
      <ProductGrid 
        category={selectedCategory}
        gender={selectedGender}
        mainCategory={selectedMainCategory}
        subCategory={selectedSubCategory}
      />

      {/* 하단 탭바 */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
