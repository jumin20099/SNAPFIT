'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2, Check, Copy, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlacedItem } from '@/entities/cody/model'
import { saveOutfitToDatabase, type OutfitData } from '@/lib/outfit-api'
import { downloadCodyAsImage } from '@/lib/image-utils'

interface CodySaveModalProps {
  isOpen: boolean
  onClose: () => void
  codyData: {
    items: PlacedItem[]
    background: {
      type: 'color' | 'image'
      selectedBackground: string
      customColor: string
    }
    timestamp: number
  }
  onSaveToCommunity?: () => void
}

export function CodySaveModal({ 
  isOpen, 
  onClose, 
  codyData, 
  onSaveToCommunity 
}: CodySaveModalProps) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [codyName, setCodyName] = useState('')
  const [isPublic, setIsPublic] = useState(true) // 공개/비공개 상태

  // 코디를 이미지로 다운로드
  const handleDownloadImage = async () => {
    console.log('=== handleDownloadImage 호출됨 ===', { codyData, codyName })
    setIsDownloading(true)
    try {
      const filename = codyName.trim() 
        ? `${codyName.trim()}-${new Date().toISOString().split('T')[0]}.png`
        : `cody-${new Date().toISOString().split('T')[0]}.png`
      
      console.log('다운로드할 파일명:', filename)
      const blob = await downloadCodyAsImage(codyData, filename)
      
      // Blob을 다운로드
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      
      console.log('이미지 다운로드 완료')
    } catch (error) {
      console.error('이미지 다운로드 실패:', error)
      alert('이미지 다운로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsDownloading(false)
    }
  }

  // 커뮤니티 게시글로 export
  const handleExportToCommunity = async () => {
    if (!codyName.trim()) {
      alert('코디 이름을 입력해주세요.')
      return
    }

    setIsExporting(true)
    try {
      // 코디 이미지 생성
      const codyImageBlob = await downloadCodyAsImage(codyData, `${codyName.trim()}-community.png`)
      
      // Blob을 Base64로 변환
      const reader = new FileReader()
      reader.onload = () => {
        const base64Image = reader.result as string
        
        // 코디 데이터에 이름 추가
        const codyDataWithName = {
          ...codyData,
          name: codyName.trim()
        }
        
        // localStorage에 데이터 저장 (URL 파라미터 대신)
        const exportData = {
          codyData: codyDataWithName,
          codyImage: base64Image,
          timestamp: Date.now()
        }
        localStorage.setItem('cody-export-data', JSON.stringify(exportData))
        
        // 게시글 작성 페이지로 이동
        window.location.href = '/community/create'
      }
      reader.readAsDataURL(codyImageBlob)
      
    } catch (error) {
      console.error('커뮤니티 export 실패:', error)
      alert('커뮤니티 공유에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsExporting(false)
    }
  }

  // 코디 데이터를 데이터베이스에 저장
  const handleSaveCody = async () => {
    if (!codyName.trim()) {
      alert('코디 이름을 입력해주세요.')
      return
    }

    try {
      const outfitData: OutfitData = {
        name: codyName.trim(),
        items: codyData.items,
        background: codyData.background,
        timestamp: codyData.timestamp,
        isPublic: isPublic
      }
      
      const savedOutfit = await saveOutfitToDatabase(outfitData)
      console.log('코디가 데이터베이스에 저장되었습니다:', savedOutfit)
      setIsSaved(true)
    } catch (error) {
      console.error('코디 저장 실패:', error)
      // 실패 시 localStorage에 백업 저장
      try {
        const savedCodies = JSON.parse(localStorage.getItem('my-codies') || '[]')
        const newCody = {
          id: Date.now().toString(),
          name: codyName.trim(),
          ...codyData,
          createdAt: new Date().toISOString()
        }
        savedCodies.unshift(newCody)
        localStorage.setItem('my-codies', JSON.stringify(savedCodies))
        setIsSaved(true)
      } catch (backupError) {
        console.error('백업 저장도 실패:', backupError)
      }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-dark-sub rounded-lg p-6 w-full max-w-md mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              코디 저장
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 저장 완료 상태 */}
          {isSaved ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                코디가 저장되었습니다!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                마이페이지의 "내 코디" 탭에서 확인할 수 있습니다.
              </p>
              
              {/* 액션 버튼들 */}
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/me')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  마이페이지에서 확인
                </Button>
                
                <Button
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? '다운로드 중...' : '이미지로 저장'}
                </Button>
                
                <Button
                  onClick={handleExportToCommunity}
                  disabled={isExporting}
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isExporting ? '게시 중...' : '커뮤니티에 게시'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* 코디 이름 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  코디 이름
                </label>
                <input
                  type="text"
                  value={codyName}
                  onChange={(e) => setCodyName(e.target.value)}
                  placeholder="예: 오늘의 캐주얼 룩"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  maxLength={50}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {codyName.length}/50
                </div>
              </div>

              {/* 공개/비공개 설정 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  공개 여부
                </label>
                <div className="space-y-3">
                  {/* 공개 여부 토글 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isPublic ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isPublic ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {isPublic ? '공개' : '비공개'}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isPublic 
                            ? '다른 사용자들이 볼 수 있습니다' 
                            : '나만 볼 수 있습니다'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 공개 시 노출 안내 */}
                  {isPublic && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        💡 <strong>공개 시 노출 안내:</strong> 이 코디는 커뮤니티 페이지의 프로필과 연관 상품에 노출될 수 있습니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 코디 미리보기 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  코디 아이템 {codyData.items.length}개
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* 버튼들 */}
              <div className="space-y-3">
                <Button
                  onClick={handleSaveCody}
                  className="w-full"
                  size="lg"
                  disabled={!codyName.trim()}
                >
                  <Check className="w-4 h-4 mr-2" />
                  코디 저장하기
                </Button>
                
                <Button
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? '이미지 생성 중...' : '이미지로 저장'}
                </Button>

                <Button
                  onClick={handleExportToCommunity}
                  disabled={isExporting || !codyName.trim()}
                  className="w-full"
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isExporting ? '커뮤니티 업로드 중...' : '커뮤니티로 내보내기'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
