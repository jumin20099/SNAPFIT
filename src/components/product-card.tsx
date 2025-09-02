'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
  category: string
  brand: string
  tags: string[]
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const router = useRouter()

  const handleCardClick = () => {
    // 상품 상세 페이지로 이동
    router.push(`/products/${product.id}`)
  }

  const handleCodyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 리팩토링 이전의 메인 페이지(코디 화면)로 이동
    router.push(`/cody-system?pid=${product.id}`)
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  return (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
        {/* 이미지 영역 */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              isImageLoaded ? 'scale-100' : 'scale-110'
            )}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* 좋아요 버튼 */}
          <button
            onClick={handleLikeClick}
            className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-white dark:hover:bg-gray-800"
          >
            <Heart
              size={18}
              className={cn(
                'transition-all duration-200',
                isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            />
          </button>

          {/* 카테고리 태그 */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-lg backdrop-blur-sm">
              {product.category}
            </span>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-1">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {product.brand}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ₩{product.price.toLocaleString()}
            </p>
          </div>

          {/* 태그 */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 코디 해보기 버튼 */}
          <Button
            onClick={handleCodyClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl py-3 transition-all duration-200"
            size="lg"
          >
            <ShoppingBag size={18} className="mr-2" />
            코디 해보기
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 