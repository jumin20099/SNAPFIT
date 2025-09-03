'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
}

interface SearchHistoryItem {
  id: string
  query: string
  timestamp: number
}

interface PopularSearchItem {
  id: string
  query: string
  rank: number
  trend: 'up' | 'down' | 'stable'
}

interface TrendingSearchItem {
  id: string
  query: string
  rank: number
}

export function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [popularSearches, setPopularSearches] = useState<PopularSearchItem[]>([])
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearchItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 검색 기록 로드
  useEffect(() => {
    if (isOpen) {
      loadSearchHistory()
      loadPopularSearches()
      loadTrendingSearches()
      // 포커스 설정
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // 검색 기록 로드
  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem('searchHistory')
      if (history) {
        setSearchHistory(JSON.parse(history))
      }
    } catch (error) {
      console.error('검색 기록 로드 실패:', error)
    }
  }

  // 인기 검색어 로드 (실제 API 호출)
  const loadPopularSearches = async () => {
    setIsLoading(true)
    try {
      // 실제 API 호출
      const response = await fetch('/api/search/popular')
      if (response.ok) {
        const data = await response.json()
        setPopularSearches(data)
      } else {
        // API 실패 시 빈 배열
        setPopularSearches([])
      }
    } catch (error) {
      console.error('인기 검색어 로드 실패:', error)
      setPopularSearches([])
    } finally {
      setIsLoading(false)
    }
  }

  // 급상승 검색어 로드 (실제 API 호출)
  const loadTrendingSearches = async () => {
    try {
      // 실제 API 호출
      const response = await fetch('/api/search/trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingSearches(data)
      } else {
        // API 실패 시 빈 배열
        setTrendingSearches([])
      }
    } catch (error) {
      console.error('급상승 검색어 로드 실패:', error)
      setTrendingSearches([])
    }
  }

  // 검색 실행
  const handleSearch = (query: string) => {
    if (!query.trim()) return

    // 검색 기록에 추가
    const newHistoryItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now()
    }

    const updatedHistory = [newHistoryItem, ...searchHistory.filter(item => item.query !== query.trim())].slice(0, 10)
    setSearchHistory(updatedHistory)

    // 로컬 스토리지에 저장
    try {
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('검색 기록 저장 실패:', error)
    }

    // 검색 실행
    onSearch(query.trim())
    onClose()
  }

  // 검색 기록 삭제
  const removeSearchHistory = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id)
    setSearchHistory(updatedHistory)
    
    try {
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('검색 기록 삭제 실패:', error)
    }
  }

  // 모든 검색 기록 삭제
  const clearAllHistory = () => {
    setSearchHistory([])
    try {
      localStorage.removeItem('searchHistory')
    } catch (error) {
      console.error('검색 기록 전체 삭제 실패:', error)
    }
  }

  // 트렌드 아이콘 렌더링
  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} className="text-red-500" />
      case 'down':
        return <TrendingDown size={12} className="text-blue-500" />
      default:
        return <Minus size={12} className="text-gray-400" />
    }
  }

  // 현재 시간 포맷팅
  const getCurrentTime = () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    return `${month}.${day} ${hour}:${minute}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* 검색 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center gap-3">
            {/* 검색 입력 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                ref={inputRef}
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery)
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-200"
              />
            </div>
            
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* 검색 내용 */}
        <div className="max-w-md mx-auto px-4 py-4 space-y-6">
          {/* 최근 검색어 */}
          {searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">최근 검색어</h3>
                <button
                  onClick={clearAllHistory}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  모두삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2"
                  >
                    <button
                      onClick={() => handleSearch(item.query)}
                      className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {item.query}
                    </button>
                    <button
                      onClick={() => removeSearchHistory(item.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 인기 검색어 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">인기 검색어</h3>
              <span className="text-xs text-gray-500">{getCurrentTime()}, 기준</span>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : popularSearches.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {popularSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearch(item.query)}
                    className="flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded transition-colors"
                  >
                    <span className="text-sm font-medium text-blue-600 w-4">{item.rank}</span>
                    <span className="text-sm text-gray-700 flex-1">{item.query}</span>
                    {renderTrendIcon(item.trend)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">인기 검색어를 불러올 수 없습니다</p>
              </div>
            )}
          </div>

          {/* 급상승 검색어 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">급상승 검색어</h3>
              <span className="text-xs text-gray-500">{getCurrentTime()}, 기준</span>
            </div>
            {trendingSearches.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {trendingSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearch(item.query)}
                    className="flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded transition-colors"
                  >
                    <span className="text-sm font-medium text-blue-600 w-4">{item.rank}</span>
                    <span className="text-sm text-gray-700 flex-1">{item.query}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">급상승 검색어를 불러올 수 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

