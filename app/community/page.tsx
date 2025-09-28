'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationModal } from '@/components/ui/NotificationModal'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CommunityFeed } from '@/components/community/CommunityFeed'

export default function CommunityPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'mostCommented' | 'trending'>('popular')
  const [activeTab, setActiveTab] = useState('snap')
  const [showSearch, setShowSearch] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const handlePostClick = useCallback((postId: number) => {
    router.push(`/community/${postId}`)
  }, [router])

  const handleSortChange = useCallback((value: 'latest' | 'popular' | 'mostCommented') => {
    setSortBy(value)
  }, [])

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
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-sub border-b border-gray-200 dark:border-dark-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-2xl text-light-accent dark:text-dark-accent">SNAP</div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/community/create')}
                className="bg-light-accent dark:bg-dark-accent hover:bg-light-accent/90 dark:hover:bg-dark-accent/90 text-white px-4 py-2 rounded-lg font-medium"
              >
                글 작성
              </Button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-dark-text" />
              </button>
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover.bg-dark-border rounded-full transition-colors relative"
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-3 bg-transparent h-12 p-0 border-b border-gray-200">
            <TabsTrigger value="snap" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full text-base font-medium">
              스냅
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full text-base font-medium">
              랭킹
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full text-base font-medium">
              팔로잉
            </TabsTrigger>
          </TabsList>

          <TabsContent value="snap" className="m-0">
            <div className="mb-4">
              <span className="text-gray-600">{totalCount.toLocaleString()}개</span>
            </div>

            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
              <FilterDropdown label="모든" />
              <FilterDropdown label="남" />
              <FilterDropdown label="여" />
              <FilterDropdown label="유형" />
              <FilterDropdown label="계절" />
              <FilterDropdown label="스타일" />
              <FilterDropdown label="키/몸무게" />
              <FilterDropdown label="TPO" />
              <FilterDropdown label="카테고리" />
              <FilterDropdown label="브랜드" />
              <div className="ml-auto">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-32 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">인기순</SelectItem>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="mostCommented">댓글순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CommunityFeed
              sortBy={sortBy}
              searchTerm={searchTerm}
              activeTab={activeTab}
              onPostClick={handlePostClick}
              onTotalCountChange={setTotalCount}
            />
          </TabsContent>

          <TabsContent value="ranking" className="m-0">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">랭킹 시스템</h3>
              <p className="text-gray-600 mb-4">인기 게시글과 사용자 랭킹을 확인해보세요</p>
              <div className="text-sm text-gray-500">
                <p>• 일일 인기 게시글</p>
                <p>• 주간 인기 게시글</p>
                <p>• 인기 사용자</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="following" className="m-0">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">팔로잉</h3>
              <p className="text-gray-600 mb-4">팔로우한 사용자들의 최신 게시글을 확인해보세요</p>
              <div className="text-sm text-gray-500">
                <p>• 팔로우한 사용자 게시글</p>
                <p>• 실시간 업데이트</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  )
}

function FilterDropdown({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap">
      <span>{label}</span>
      <ChevronDown className="w-4 h-4" />
    </button>
  )
}
