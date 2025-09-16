'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Users, Heart, Clock, User, Shirt } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

const tabs = [
  { id: 'wishlist', label: '좋아요', icon: Heart, path: '/like' },
  { id: 'community', label: '커뮤니티', icon: Users, path: '/community' },
  { id: 'home', label: '홈', icon: Home, path: '/' },
  { id: 'cody', label: '코디', icon: Shirt, path: '/cody' },
  { id: 'profile', label: '마이', icon: User, path: '/me' },
]

// 헥스 색상을 RGB로 변환하는 함수
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255'
}

interface BottomTabBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCodyPage, setIsCodyPage] = useState(false)
  const [codyBackground, setCodyBackground] = useState({
    type: 'color',
    selectedBackground: 'white',
    customColor: '#ffffff'
  })

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

  const handleTabClick = (tab: typeof tabs[0]) => {
    onTabChange(tab.id)
    if (tab.path) {
      router.push(tab.path)
    }
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 border-t safe-area-pb ${
        isCodyPage 
          ? 'border-light-border/50 dark:border-dark-border/50' 
          : 'border-light-border dark:border-dark-border bg-light-sub dark:bg-dark-sub'
      }`}
      style={isCodyPage ? {
        // 코디 페이지에서만 블러 처리 및 동적 배경색 적용
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
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {/* 아이콘 */}
                <div className="relative">
                       <Icon
                         size={18}
                         className={`transition-colors ${
                           isActive 
                             ? 'text-white dark:text-dark-text' 
                             : 'text-gray-300 dark:text-gray-500'
                         }`}
                       />
                  {/* 활성 상태 인디케이터 */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-light-accent dark:bg-dark-accent rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>

                {/* 라벨 */}
                     <span
                       className={`text-[10px] font-medium transition-colors ${
                         isActive 
                           ? 'text-white dark:text-dark-text' 
                           : 'text-gray-300 dark:text-gray-500'
                       }`}
                     >
                  {tab.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
