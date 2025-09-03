'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Grid3X3, Heart, Clock, User, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'

const tabs = [
  { id: 'home', label: '홈', icon: Home, path: '/' },
  { id: 'category', label: '카테고리', icon: Grid3X3, path: '/category' },
  { id: 'wishlist', label: '찜', icon: Heart, path: '/wishlist' },
  { id: 'cart', label: '장바구니', icon: ShoppingBag, path: '/cart' },
  { id: 'profile', label: '마이', icon: User, path: '/profile' },
]

interface BottomTabBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const router = useRouter()

  const handleTabClick = (tab: typeof tabs[0]) => {
    onTabChange(tab.id)
    if (tab.path) {
      router.push(tab.path)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {/* 아이콘 */}
                <div className="relative">
                  <Icon
                    size={20}
                    className={`transition-colors ${
                      isActive ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  />
                  {/* 활성 상태 인디케이터 */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>

                {/* 라벨 */}
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-gray-800' : 'text-gray-400'
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
