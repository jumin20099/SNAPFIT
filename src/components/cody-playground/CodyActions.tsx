'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Download, Share2, Loader2, Check } from 'lucide-react'

interface Product {
  productIdx: number
  productName: string
  productImage: string
  productPrice: number
  majorCategory: string
  subCategory: string
  storeName: string
}

interface CodyActionsProps {
  selectedProducts: Record<string, Product | null>
  onSave: () => void
  onDownload: () => void
  onExportToCommunity: () => void
  className?: string
}

export function CodyActions({
  selectedProducts,
  onSave,
  onDownload,
  onExportToCommunity,
  className = ''
}: CodyActionsProps) {
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [saved, setSaved] = useState(false)

  // 선택된 상품 개수 계산
  const selectedCount = Object.values(selectedProducts).filter(Boolean).length

  // 코디 저장
  const handleSave = async () => {
    if (selectedCount === 0) return

    setSaving(true)
    try {
      await onSave()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving cody:', error)
    } finally {
      setSaving(false)
    }
  }

  // 이미지 다운로드
  const handleDownload = async () => {
    if (selectedCount === 0) return

    setDownloading(true)
    try {
      await onDownload()
    } catch (error) {
      console.error('Error downloading image:', error)
    } finally {
      setDownloading(false)
    }
  }

  // 커뮤니티 export
  const handleExportToCommunity = async () => {
    if (selectedCount === 0) return

    setExporting(true)
    try {
      await onExportToCommunity()
    } catch (error) {
      console.error('Error exporting to community:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      {/* 선택된 상품 요약 */}
      {selectedCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">{selectedCount}개</span> 상품이 선택되었습니다
          </p>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 저장 버튼 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={selectedCount === 0 || saving}
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
            selectedCount === 0 || saving
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : saved
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin mb-1" />
          ) : saved ? (
            <Check className="w-5 h-5 mb-1" />
          ) : (
            <Save className="w-5 h-5 mb-1" />
          )}
          <span className="text-xs font-medium">
            {saved ? '저장됨' : '저장'}
          </span>
        </motion.button>

        {/* 다운로드 버튼 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          disabled={selectedCount === 0 || downloading}
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
            selectedCount === 0 || downloading
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
          }`}
        >
          {downloading ? (
            <Loader2 className="w-5 h-5 animate-spin mb-1" />
          ) : (
            <Download className="w-5 h-5 mb-1" />
          )}
          <span className="text-xs font-medium">다운로드</span>
        </motion.button>

        {/* 커뮤니티 공유 버튼 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportToCommunity}
          disabled={selectedCount === 0 || exporting}
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
            selectedCount === 0 || exporting
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
          }`}
        >
          {exporting ? (
            <Loader2 className="w-5 h-5 animate-spin mb-1" />
          ) : (
            <Share2 className="w-5 h-5 mb-1" />
          )}
          <span className="text-xs font-medium">공유</span>
        </motion.button>
      </div>

      {/* 도움말 텍스트 */}
      {selectedCount === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            상품을 선택하여 코디를 시작해보세요
          </p>
        </div>
      )}
    </motion.div>
  )
}
