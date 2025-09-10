'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Download, Share2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlacedItem } from '@/entities/cody/model'
import { CodyDisplay } from './CodyDisplay'
import { getMyOutfits, deleteOutfit, type OutfitResponse } from '@/lib/outfit-api'

interface SavedCody {
  id: string
  items: PlacedItem[]
  background: {
    type: 'color' | 'image'
    selectedBackground: string
    customColor: string
  }
  timestamp: number
  createdAt: string
}

export function MyCodyList() {
  const [savedCodies, setSavedCodies] = useState<OutfitResponse[]>([])
  const [loading, setLoading] = useState(true)

  // 저장된 코디 목록 로드
  useEffect(() => {
    const loadCodies = async () => {
      try {
        const codies = await getMyOutfits()
        setSavedCodies(codies)
      } catch (error) {
        console.error('코디 목록 로드 실패:', error)
        // 실패 시 localStorage에서 백업 로드
        try {
          const localCodies = JSON.parse(localStorage.getItem('my-codies') || '[]')
          setSavedCodies(localCodies)
        } catch (localError) {
          console.error('로컬 백업 로드도 실패:', localError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadCodies()
  }, [])

  // 코디 삭제
  const handleDeleteCody = async (outfitIdx: number) => {
    if (confirm('이 코디를 삭제하시겠습니까?')) {
      try {
        await deleteOutfit(outfitIdx)
        setSavedCodies(prev => prev.filter(cody => cody.outfitIdx !== outfitIdx))
      } catch (error) {
        console.error('코디 삭제 실패:', error)
        alert('코디 삭제에 실패했습니다')
      }
    }
  }

  // 코디 이미지 다운로드
  const handleDownloadImage = (codyId: string) => {
    // 코디를 이미지로 변환하는 로직
    console.log('코디 이미지 다운로드:', codyId)
  }

  // 커뮤니티에 공유
  const handleShareToCommunity = (cody: SavedCody) => {
    // 커뮤니티 게시글 생성 로직
    console.log('커뮤니티 공유:', cody)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (savedCodies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👕</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          저장된 코디가 없습니다
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          코디 플레이그라운드에서 코디를 만들어 저장해보세요!
        </p>
        <Button
          onClick={() => window.location.href = '/cody'}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          코디 만들기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          내 코디 ({savedCodies.length}개)
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {savedCodies.map((cody, index) => {
            // JSON 문자열을 파싱하여 코디 데이터 추출
            let codyData
            try {
              codyData = JSON.parse(cody.outfitItem)
            } catch (error) {
              console.error('코디 데이터 파싱 실패:', error)
              return null
            }

            return (
              <motion.div
                key={cody.outfitIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 relative group"
              >
                {/* 코디 미리보기 */}
                <div className="mb-3">
                  <CodyDisplay
                    codyData={codyData}
                    showProductInfo={false}
                    className="aspect-square"
                  />
                </div>

                {/* 코디 정보 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(cody.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {codyData.name || `코디 #${cody.outfitIdx}`}
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDownloadImage(cody.outfitIdx.toString())}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleShareToCommunity(cody)}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteCody(cody.outfitIdx)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
