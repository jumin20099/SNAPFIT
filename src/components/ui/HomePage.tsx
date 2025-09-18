'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { StickyHeader } from './StickyHeader'
import { HeroBanner } from './HeroBanner'
import { ProductGrid } from './ProductGrid'
import { BottomTabBar } from './BottomTabBar'

export function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedGender, setSelectedGender] = useState<string>('all')
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>()
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>()
  const [activeTab, setActiveTab] = useState('home')

  // 로그인 성공 시 토큰을 로컬스토리지에 저장
  useEffect(() => {
    const token = searchParams.get('token')
    const userIdx = searchParams.get('userIdx')
    const login = searchParams.get('login')

    if (login === 'success' && token) {
      // 토큰을 로컬스토리지에 저장
      localStorage.setItem('token', token)
      if (userIdx) {
        localStorage.setItem('userIdx', userIdx)
      }
      
      // URL에서 토큰 파라미터 제거
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('token')
      newUrl.searchParams.delete('userIdx')
      newUrl.searchParams.delete('login')
      
      // URL 업데이트 (히스토리 대체)
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  const handleCategorySelect = (genderId: string, mainCategoryId: string, subCategoryId?: string) => {
    setSelectedGender(genderId)
    setSelectedMainCategory(mainCategoryId)
    setSelectedSubCategory(subCategoryId)
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pb-20">
      {/* 고정 헤더 (카테고리 선택 포함) */}
      <StickyHeader
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedGender={selectedGender}
        selectedMainCategory={selectedMainCategory}
        selectedSubCategory={selectedSubCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* 히어로 배너 */}
      <HeroBanner />

      {/* 상품 그리드 */}
      <ProductGrid 
        category={selectedCategory}
        gender={selectedGender}
        mainCategory={selectedMainCategory}
        subCategory={selectedSubCategory}
      />

      {/* 하단 탭 바 */}
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
