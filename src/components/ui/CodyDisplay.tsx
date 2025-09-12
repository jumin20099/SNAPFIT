'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlacedItem } from '@/entities/cody/model'

interface CodyDisplayProps {
  codyData: {
    items: PlacedItem[]
    background: {
      type: 'color' | 'image'
      selectedBackground: string
      customColor: string
    }
    timestamp: number
  }
  showProductInfo?: boolean
  className?: string
  onDownload?: () => void
  showDownloadButton?: boolean
}

export function CodyDisplay({ 
  codyData, 
  showProductInfo = true, 
  className = '',
  onDownload,
  showDownloadButton = false
}: CodyDisplayProps) {
  const router = useRouter()
  const [productDetails, setProductDetails] = useState<Record<string, any>>({})

  // 상품 상세 정보 가져오기
  useEffect(() => {
    const fetchProductDetails = async () => {
      const details: Record<string, any> = {}
      
      for (const item of codyData.items) {
        if (item.itemId) {
          try {
            const response = await fetch(`/api/products/${item.itemId}`)
            if (response.ok) {
              const product = await response.json()
              details[item.itemId] = product
            }
          } catch (error) {
            console.error(`상품 ${item.itemId} 정보 가져오기 실패:`, error)
          }
        }
      }
      
      setProductDetails(details)
    }

    fetchProductDetails()
  }, [codyData.items])

  // 상품 클릭 핸들러
  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  return (
    <div className={`relative ${className}`}>
      {/* 코디 캔버스 */}
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="relative w-full h-full">
          {/* 배경 */}
          <div 
            className="absolute inset-0"
            style={{
              background: codyData.background.type === 'color' 
                ? (codyData.background.selectedBackground === 'custom' 
                    ? codyData.background.customColor 
                    : codyData.background.selectedBackground === 'white' ? '#ffffff' :
                      codyData.background.selectedBackground === 'black' ? '#000000' :
                      codyData.background.selectedBackground === 'cool' ? '#f0f9ff' :
                      codyData.background.selectedBackground === 'warm' ? '#fef3c7' :
                      codyData.background.selectedBackground === 'lovely' ? '#fce7f3' : '#ffffff')
                : `url(${codyData.background.selectedBackground})`,
              backgroundSize: codyData.background.type === 'image' ? 'cover' : 'auto',
              backgroundPosition: codyData.background.type === 'image' ? 'center' : 'top left',
              backgroundRepeat: codyData.background.type === 'image' ? 'no-repeat' : 'repeat'
            }}
          />
          
          {/* 코디 아이템들 */}
          {codyData.items.map((item, index) => (
            <motion.div
              key={item.id}
              className="absolute"
              style={{
                left: `${item.nx * 100}%`,
                top: `${item.ny * 100}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                zIndex: item.z || index,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="relative">
                {/* 상품 이미지 */}
                <div className="w-16 h-16 bg-white dark:bg-gray-600 rounded-lg shadow-md overflow-hidden">
                  {item.src ? (
                    <img
                      src={item.src}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-xs text-center">
                        <div className="text-lg">👕</div>
                        <div className="text-xs">{item.name}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 상품 정보 오버레이 */}
                {showProductInfo && item.itemId && productDetails[item.itemId] && (
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="font-medium">{productDetails[item.itemId].productName}</div>
                    <div className="text-gray-300">
                      {productDetails[item.itemId].productPrice?.toLocaleString()}원
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 상품 정보 리스트 */}
      {showProductInfo && codyData.items.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            사용된 상품 ({codyData.items.length}개)
          </h4>
          <div className="space-y-2">
            {codyData.items.map((item) => {
              const product = productDetails[item.itemId || '']
              return (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => item.itemId && handleProductClick(item.itemId)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* 상품 이미지 */}
                  <div className="w-10 h-10 bg-white dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                    {item.src ? (
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-xs">👕</div>
                      </div>
                    )}
                  </div>
                  
                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {product?.productName || item.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {product?.productPrice?.toLocaleString()}원
                    </div>
                  </div>
                  
                  {/* 화살표 */}
                  <div className="text-gray-400">
                    →
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* 다운로드 버튼 */}
      {showDownloadButton && onDownload && (
        <div className="absolute top-2 right-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white/90 shadow-md"
            onClick={onDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
