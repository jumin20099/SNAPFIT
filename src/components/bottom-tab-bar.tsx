'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Palette, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const tabs = [
  { id: 'home', label: '홈', icon: Home, path: '/' },
  { id: 'community', label: '커뮤니티', icon: Users, path: '/community' },
  { id: 'cody', label: '코디', icon: Palette, path: '/cody' },
  { id: 'me', label: '마이', icon: User, path: '/me' }
]

export function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  return (
    <nav
      role="tablist"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          const Icon = tab.icon
          
          return (
            <motion.button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center min-h-[56px] px-3 py-2 rounded-xl transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <Icon
                size={24}
                className={cn(
                  'mb-1 transition-all duration-200',
                  isActive ? 'scale-110' : 'scale-100'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium transition-all duration-200',
                  isActive ? 'font-semibold' : 'font-normal'
                )}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
