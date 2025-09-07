'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SearchModal } from './SearchModal'
import { NotificationModal } from './NotificationModal'

export function StickyHeader() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (query: string) => {
    // 실제 검색 로직 구현
    console.log('검색어:', query)
    // 여기서 검색 결과 페이지로 이동하거나 검색 결과를 표시
    // 예: router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleCartClick = () => {
    router.push('/cart')
  }

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 bg-white dark:bg-dark-sub transition-all duration-200 ${
          isScrolled ? 'shadow-sm border-b border-gray-100 dark:border-dark-border' : ''
        }`}
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
