'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, ShoppingBag } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { SearchModal } from './SearchModal'
import { NotificationModal } from './NotificationModal'

// 헥스 색상을 RGB로 변환하는 함수
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255'
}

export function StickyHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isCodyPage, setIsCodyPage] = useState(false)
  const [codyBackground, setCodyBackground] = useState({
    type: 'color',
    selectedBackground: 'white',
    customColor: '#ffffff'
  })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 코디 페이지 감지 및 배경 정보 로드
  useEffect(() => {
    const isCody = pathname === '/cody' || pathname.startsWith('/cody')
    setIsCodyPage(isCody)
    
    if (isCody && typeof window !== 'undefined') {
      const backgroundType = localStorage.getItem('cody-background-type') || 'color'
      const selectedBackground = localStorage.getItem('cody-background') || 'white'
      const customColor = localStorage.getItem('cody-custom-color') || '#ffffff'
      
      setCodyBackground({
        type: backgroundType as 'color' | 'image',
        selectedBackground,
        customColor
      })
    }
  }, [pathname])

  const handleSearch = (query: string) => {
    // 검색 결과 페이지로 이동
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleCartClick = () => {
    router.push('/cart')
  }

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isCodyPage 
            ? (isScrolled ? 'border-b border-gray-100/50 dark:border-dark-border/50' : '')
            : `bg-white dark:bg-dark-sub ${isScrolled ? 'shadow-sm border-b border-gray-100 dark:border-dark-border' : ''}`
        }`}
        style={isCodyPage ? {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: codyBackground.type === 'color' 
            ? (codyBackground.selectedBackground === 'white' 
                ? 'rgba(255, 255, 255, 0.3)' 
                : codyBackground.selectedBackground === 'black'
                ? 'rgba(0, 0, 0, 0.3)'
                : `rgba(${hexToRgb(codyBackground.customColor)}, 0.3)`)
            : 'rgba(255, 255, 255, 0.3)',
        } : undefined}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 좌측: 로고 */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-light-accent dark:text-dark-accent">SNAPFIT</h1>
            </div>

            {/* 우측: 아이콘들 */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
              >
                <Search size={20} className="text-gray-700 dark:text-dark-text" />
              </button>
              <button 
                onClick={() => setIsNotificationModalOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors relative"
              >
                <Bell size={20} className="text-gray-700 dark:text-dark-text" />
                {/* 알림 뱃지 */}
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={handleCartClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
              >
                <ShoppingBag size={20} className="text-gray-700 dark:text-dark-text" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 검색 모달 */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleSearch}
      />

      {/* 알림 모달 */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </>
  )
}
