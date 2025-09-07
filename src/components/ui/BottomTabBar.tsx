'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Users, Heart, Clock, User, Shirt } from 'lucide-react'
import { useRouter } from 'next/navigation'

const tabs = [
  { id: 'wishlist', label: '좋아요', icon: Heart, path: '/like' },
  { id: 'community', label: '커뮤니티', icon: Users, path: '/community' },
  { id: 'home', label: '홈', icon: Home, path: '/' },
  { id: 'cody', label: '코디', icon: Shirt, path: '/cody' },
  { id: 'profile', label: '마이', icon: User, path: '/me' },
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-light-sub dark:bg-dark-sub border-t border-light-border dark:border-dark-border safe-area-pb">
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
