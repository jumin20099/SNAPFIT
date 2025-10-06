'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bell, Search, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationModal } from '@/components/ui/NotificationModal'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import CommunityHeader from '@/components/community/CommunityHeader'
import Link from 'next/link'

type BoardType = 'outfits' | 'questions' | 'info'

export default function CommunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'mostCommented' | 'trending'>('popular')
  
  // URL 파라미터에서 초기 activeTab 설정 (즉시 실행)
  const initialTab = (() => {
    const type = searchParams.get('type') as BoardType
    if (type && ['outfits', 'questions', 'info'].includes(type)) {
      console.log('[CommunityPage] 초기 activeTab:', type)
      return type
    }
    console.log('[CommunityPage] 초기 activeTab: outfits (기본값)')
    return 'outfits' as BoardType
  })()
  
  const [activeTab, setActiveTab] = useState<BoardType>(initialTab)
  const [showSearch, setShowSearch] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined)

  const handlePostClick = useCallback((postId: number) => {
    router.push(`/community/${postId}`)
  }, [router])

  const handleEditPost = useCallback((postId: number) => {
    router.push(`/community/${postId}?edit=true`)
  }, [router])

  const handleDeletePost = useCallback((postId: number) => {
    // 삭제 확인 모달을 표시하거나 바로 삭제 처리
    if (confirm('게시글을 삭제하시겠습니까?')) {
      // TODO: 게시글 삭제 API 호출
      console.log('게시글 삭제:', postId)
    }
  }, [])

  const handleSortChange = useCallback((value: 'latest' | 'popular' | 'mostCommented') => {
    setSortBy(value)
  }, [])

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const userId = localStorage.getItem('userIdx')
    if (userId) {
      setCurrentUserId(parseInt(userId, 10))
    }
  }, [])

  // URL 파라미터 변경 시 activeTab 업데이트
  useEffect(() => {
    const type = searchParams.get('type') as BoardType
    console.log('[CommunityPage] URL 파라미터 변경:', { type, currentActiveTab: activeTab })
    
    if (type && ['outfits', 'questions', 'info'].includes(type)) {
      if (activeTab !== type) {
        setActiveTab(type)
        console.log('[CommunityPage] activeTab 업데이트:', type)
      }
    } else if (activeTab !== 'outfits') {
      setActiveTab('outfits')
      console.log('[CommunityPage] activeTab 업데이트: outfits (기본값)')
    }
  }, [searchParams])

  // 탭 변경 시 URL 업데이트
  const handleTabChange = useCallback((tab: string) => {
    const boardType = tab as BoardType
    setActiveTab(boardType)
    
    const params = new URLSearchParams(searchParams.toString())
    if (boardType === 'outfits') {
      params.delete('type')
    } else {
      params.set('type', boardType)
    }
    
    const newUrl = params.toString() ? `/community?${params.toString()}` : '/community'
    router.push(newUrl, { scroll: false })
  }, [searchParams, router])

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
      <CommunityHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showSearch={showSearch}
        onSearchToggle={() => setShowSearch(!showSearch)}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">

          <TabsContent value="outfits" className="m-0">
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
              key={`outfits-${sortBy}-${activeTab}`}
              sortBy={sortBy}
              searchTerm={searchTerm}
              activeTab={activeTab}
              onPostClick={handlePostClick}
              onTotalCountChange={setTotalCount}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              currentUserId={currentUserId}
            />
          </TabsContent>

          <TabsContent value="questions" className="m-0">
            <div className="mb-4">
              <span className="text-gray-600">{totalCount.toLocaleString()}개</span>
            </div>

            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
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
              key={`questions-${sortBy}-${activeTab}`}
              sortBy={sortBy}
              searchTerm={searchTerm}
              activeTab={activeTab}
              onPostClick={handlePostClick}
              onTotalCountChange={setTotalCount}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              currentUserId={currentUserId}
            />
          </TabsContent>

          <TabsContent value="info" className="m-0">
            <div className="mb-4">
              <span className="text-gray-600">{totalCount.toLocaleString()}개</span>
            </div>

            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
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
              key={`info-${sortBy}-${activeTab}`}
              sortBy={sortBy}
              searchTerm={searchTerm}
              activeTab={activeTab}
              onPostClick={handlePostClick}
              onTotalCountChange={setTotalCount}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              currentUserId={currentUserId}
            />
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
