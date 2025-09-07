'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { mannequinParts, MannequinPart } from '@/constants/cody-categories'

interface Product {
  productIdx: number
  productName: string
  productImage: string
  productPrice: number
  majorCategory: string
  subCategory: string
}

interface MannequinCanvasProps {
  selectedProducts: Record<string, Product | null>
  onPartClick: (part: MannequinPart) => void
  className?: string
}

export function MannequinCanvas({ 
  selectedProducts, 
  onPartClick, 
  className = '' 
}: MannequinCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // 캔버스 크기 조정
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  // 점선 마네킹 그리기
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvasSize.width === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 캔버스 크기 설정
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 점선 스타일 설정
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 2
    ctx.strokeStyle = '#9CA3AF' // gray-400
    ctx.fillStyle = 'rgba(156, 163, 175, 0.1)'

    // 마네킹 부위 그리기
    mannequinParts.forEach(part => {
      const x = (part.position.x / 100) * canvas.width
      const y = (part.position.y / 100) * canvas.height
      const width = (part.position.width / 100) * canvas.width
      const height = (part.position.height / 100) * canvas.height

      // 부위 배경 (선택된 상품이 있을 때만)
      if (selectedProducts[part.category]) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)' // blue-500 with opacity
        ctx.fillRect(x, y, width, height)
      }

      // 부위 테두리
      ctx.strokeStyle = selectedProducts[part.category] ? '#3B82F6' : '#9CA3AF'
      ctx.strokeRect(x, y, width, height)

      // 부위 라벨
      ctx.fillStyle = selectedProducts[part.category] ? '#3B82F6' : '#6B7280'
      ctx.font = '12px Pretendard, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(part.name, x + width / 2, y + height / 2)
    })

    // 점선 스타일 리셋
    ctx.setLineDash([])
  }, [canvasSize, selectedProducts])

  return (
    <div className={`relative ${className}`}>
      {/* 캔버스 */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={(e) => {
          const canvas = canvasRef.current
          if (!canvas) return

          const rect = canvas.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * 100
          const y = ((e.clientY - rect.top) / rect.height) * 100

          // 클릭된 부위 찾기
          const clickedPart = mannequinParts.find(part => {
            const partX = part.position.x
            const partY = part.position.y
            const partWidth = part.position.width
            const partHeight = part.position.height

            return x >= partX && x <= partX + partWidth &&
                   y >= partY && y <= partY + partHeight
          })

          if (clickedPart) {
            onPartClick(clickedPart)
          }
        }}
      />

      {/* 선택된 상품 이미지 오버레이 */}
      {Object.entries(selectedProducts).map(([category, product]) => {
        if (!product) return null

        const part = mannequinParts.find(p => p.category === category)
        if (!part) return null

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              left: `${part.position.x}%`,
              top: `${part.position.y}%`,
              width: `${part.position.width}%`,
              height: `${part.position.height}%`,
              zIndex: part.zIndex + 10
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={product.productImage}
                alt={product.productName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-md"
              />
            </div>
          </motion.div>
        )
      })}

      {/* 부위별 클릭 힌트 */}
      <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        부위를 클릭하여 상품 선택
      </div>
    </div>
  )
}
