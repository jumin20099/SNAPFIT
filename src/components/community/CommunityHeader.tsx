'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationModal } from '@/components/ui/NotificationModal'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CommunityHeaderProps {
  activeTab: 'outfits' | 'questions' | 'info'
  onTabChange: (tab: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  showSearch: boolean
  onSearchToggle: () => void
}

export default function CommunityHeader({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  showSearch,
  onSearchToggle
}: CommunityHeaderProps) {
  const router = useRouter()
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)

  const handleProfileClick = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('로그인 후 사용 가능합니다.')
      return
    }
    fetchUserProfile()
  }

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        const userId = userData.userIdx || userData.id
        if (userId) {
          router.push(`/profile/${userId}`)
        } else {
          alert('사용자 정보를 가져올 수 없습니다.')
        }
      } else {
        alert('로그인 후 사용 가능합니다.')
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error)
      alert('로그인 후 사용 가능합니다.')
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-dark-sub border-b border-gray-200 dark:border-dark-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-2xl text-light-accent dark:text-dark-accent">SNAP</div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  if (activeTab === 'questions') {
                    router.push('/community/questions/create')
                  } else if (activeTab === 'info') {
                    router.push('/community/info/create')
                  } else {
                    router.push('/community/create')
                  }
                }}
                className="bg-light-accent dark:bg-dark-accent hover:bg-light-accent/90 dark:hover:bg-dark-accent/90 text-white px-4 py-2 rounded-lg font-medium"
              >
                글 작성
              </Button>
              <button
                onClick={onSearchToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-dark-text" />
              </button>
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-dark-text" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <button
                onClick={handleProfileClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
              >
                <User className="w-5 h-5 text-gray-600 dark:text-dark-text" />
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mt-4">
              <Input
                placeholder="패션 정보를 검색해보세요..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
          <TabsList className="w-full grid grid-cols-3 bg-transparent h-12 p-0 border-b border-gray-200">
            <TabsTrigger value="outfits" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full text-base font-medium">
              코디
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full text-base font-medium">
              질문
            </TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full text-base font-medium">
              정보
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </>
  )
}
