'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Download, Share2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlacedItem } from '@/entities/cody/model'
import { CodyDisplay } from './CodyDisplay'
import { getMyOutfits, deleteOutfit, toggleOutfitVisibility, type OutfitResponse } from '@/lib/outfit-api'
import { downloadCodyAsImage, generateCodyThumbnail } from '@/lib/image-utils'

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
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})
  const [thumbnailLoading, setThumbnailLoading] = useState<Record<string, boolean>>({})

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

  // 코디 목록이 로드되면 썸네일 생성
  useEffect(() => {
    if (savedCodies.length > 0) {
      savedCodies.forEach(cody => {
        generateThumbnail(cody)
      })
    }
  }, [savedCodies])

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      Object.values(thumbnails).forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [thumbnails])

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

  // 코디 공개/비공개 토글
  const handleToggleVisibility = async (outfitIdx: number, currentIsPublic: boolean) => {
    try {
      const updatedCody = await toggleOutfitVisibility(outfitIdx, !currentIsPublic)
      setSavedCodies(prev => 
        prev.map(cody => 
          cody.outfitIdx === outfitIdx 
            ? { ...cody, isPublic: updatedCody.isPublic }
            : cody
        )
      )
    } catch (error) {
      console.error('코디 공개 상태 변경 실패:', error)
      alert('코디 공개 상태 변경에 실패했습니다')
    }
  }

  // 코디 썸네일 생성
  const generateThumbnail = async (cody: OutfitResponse) => {
    const codyId = cody.outfitIdx.toString()

    // 이미 로딩 중이거나 썸네일이 있으면 스킵
    if (cody.outfitThumbnail) {
      setThumbnails(prev => prev[codyId] ? prev : ({ ...prev, [codyId]: cody.outfitThumbnail! }))
      return
    }

    if (thumbnailLoading[codyId] || thumbnails[codyId]) {
      return
    }

    try {
      setThumbnailLoading(prev => ({ ...prev, [codyId]: true }))
      
      const codyData = JSON.parse(cody.outfitItem)
      console.log(`썸네일 생성 시작: 코디 #${codyId}`, codyData)
      
      const thumbnailBlob = await generateCodyThumbnail(codyData)
      const thumbnailUrl = URL.createObjectURL(thumbnailBlob)
      
      console.log(`썸네일 생성 완료: 코디 #${codyId}`, thumbnailUrl)
      setThumbnails(prev => ({ ...prev, [codyId]: thumbnailUrl }))
    } catch (error) {
      console.error(`썸네일 생성 실패: 코디 #${codyId}`, error)
      // 에러 발생 시 기존 CodyDisplay 사용하도록 상태 유지
    } finally {
      setThumbnailLoading(prev => ({ ...prev, [codyId]: false }))
    }
  }

  const persistBackgroundPreference = (background: any) => {
    if (typeof window === 'undefined') return
    const bgType = background?.type === 'image' ? 'image' : 'color'
    const selected = background?.selectedBackground || 'white'
    const customColor = background?.customColor || '#ffffff'

    localStorage.setItem('cody-background-type', bgType)
    localStorage.setItem('cody-background', selected)
    localStorage.setItem('cody-custom-color', customColor)
  }

  const persistPlaygroundItems = (items: PlacedItem[]) => {
    if (typeof window === 'undefined') return
    const metadata = {
      savedAt: Date.now(),
      version: '1.0',
      totalItems: items.length,
      customPositions: items.filter(item => item.metadata?.isCustomPosition).length,
      lastModified: items.reduce((acc, item) => Math.max(acc, item.lastModified || 0), 0)
    }

    const payload = { items, metadata }
    localStorage.setItem('cody-playground-items', JSON.stringify(payload))
  }

  const handleLoadCody = (cody: OutfitResponse) => {
    try {
      const parsed = JSON.parse(cody.outfitItem)
      const items: PlacedItem[] = parsed.items || []
      persistPlaygroundItems(items)
      persistBackgroundPreference(parsed.background)
      localStorage.setItem('cody-last-outfit-name', parsed.name || '')
      localStorage.setItem('cody-last-outfit-id', cody.outfitIdx.toString())
      window.location.href = '/cody'
    } catch (error) {
      console.error('코디 불러오기 실패:', error)
      alert('코디 데이터를 불러올 수 없습니다.')
    }
  }

  // 코디 이미지 다운로드
  const handleDownloadImage = async (cody: OutfitResponse) => {
    try {
      // JSON 문자열을 파싱하여 코디 데이터 추출
      let codyData
      try {
        codyData = JSON.parse(cody.outfitItem)
      } catch (error) {
        console.error('코디 데이터 파싱 실패:', error)
        alert('코디 데이터를 불러올 수 없습니다')
        return
      }

      const filename = codyData.name 
        ? `${codyData.name}-${new Date().toISOString().split('T')[0]}.png`
        : `cody-${cody.outfitIdx}-${new Date().toISOString().split('T')[0]}.png`
      
      await downloadCodyAsImage(codyData, filename)
    } catch (error) {
      console.error('이미지 다운로드 실패:', error)
      alert('이미지 다운로드에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 커뮤니티에 공유
  const handleShareToCommunity = (cody: OutfitResponse) => {
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

      {/* 공개 시 노출 안내 메시지 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              공개 코디 노출 안내
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              공개로 설정한 코디는 <strong>커뮤니티 페이지의 프로필</strong>과 <strong>연관 상품</strong>에 노출될 수 있습니다. 
              다른 사용자들이 참고할 수 있도록 도움이 됩니다.
            </p>
          </div>
        </div>
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
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 relative group cursor-pointer hover:bg-gray-100/70 dark:hover:bg-gray-700/70 transition-colors"
                onClick={() => handleLoadCody(cody)}
              >
                {/* 코디 미리보기 */}
                <div className="mb-3">
                  {(() => {
                    const key = cody.outfitIdx.toString()
                    const displayThumbnail = thumbnails[key] ?? cody.outfitThumbnail
                    if (displayThumbnail) {
                      return (
                        <div className="relative aspect-[9/16] rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
                          <img
                            src={displayThumbnail}
                            alt={codyData.name || `코디 #${cody.outfitIdx}`}
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        </div>
                      )
                    }

                    if (thumbnailLoading[key]) {
                      return (
                        <div className="w-full aspect-[9/16] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                        </div>
                      )
                    }

                    return (
                      <CodyDisplay
                        codyData={codyData}
                        showProductInfo={false}
                        className="aspect-[9/16]"
                      />
                    )
                  })()}
                </div>

                {/* 코디 정보 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(cody.createdAt).toLocaleDateString()}
                    </div>
                    
                    {/* 공개/비공개 상태 표시 */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cody.isPublic 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {cody.isPublic ? '공개' : '비공개'}
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {codyData.name || `코디 #${cody.outfitIdx}`}
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    {/* 공개/비공개 토글 버튼 */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-6 w-6 p-0 ${
                        cody.isPublic 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      onClick={(event) => {
                        event.stopPropagation()
                        handleToggleVisibility(cody.outfitIdx, cody.isPublic)
                      }}
                      title={cody.isPublic ? '비공개로 변경' : '공개로 변경'}
                    >
                      {cody.isPublic ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDownloadImage(cody)
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleShareToCommunity(cody)
                      }}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeleteCody(cody.outfitIdx)
                      }}
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
