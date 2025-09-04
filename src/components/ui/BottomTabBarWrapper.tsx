'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { BottomTabBar } from './BottomTabBar'

export function BottomTabBarWrapper() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('home')

  // 경로에 따라 활성 탭 설정
  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('home')
    } else if (pathname === '/like' || pathname.startsWith('/like')) {
      setActiveTab('wishlist')
    } else if (pathname === '/community' || pathname.startsWith('/community')) {
      setActiveTab('community')
    } else if (pathname === '/cody' || pathname.startsWith('/cody')) {
      setActiveTab('cody')
    } else if (pathname === '/me' || pathname.startsWith('/me')) {
      setActiveTab('profile')
    } else {
      // 다른 페이지에서는 현재 경로에 따라 가장 가까운 탭 설정
      if (pathname.includes('product')) {
        setActiveTab('home')
      } else if (pathname.includes('partner')) {
        setActiveTab('profile')
      } else {
        setActiveTab('home')
      }
    }
  }, [pathname])

  return <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
}
