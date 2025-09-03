'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star } from 'lucide-react'
import type { Product } from '@/shared/types'

interface ProductCardProps {
  product: Product
  onLike?: (productId: string) => void
}

export function ProductCard({ product, onLike }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(product.id)
  }

  return (
    <motion.div
      className="bg-white angular-card overflow-hidden shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {/* 상품 이미지 */}
      <div className="relative aspect-[3/4] bg-gray-100">
        {!imageError ? (
          <img
            src={product.imageUrl}
            alt={`${product.brand} ${product.name}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-xs">이미지 로드 실패</div>
            </div>
          </div>
        )}



        {/* 우상단 찜 버튼 */}
        <motion.button
          onClick={handleLike}
          className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm angular-rounded flex items-center justify-center shadow-sm"
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          <Heart
            size={16}
            className={isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}
          />
        </motion.button>
      </div>

      {/* 상품 정보 */}
      <div className="p-3 space-y-2">
        {/* 브랜드명 */}
        <div className="text-xs text-gray-500 truncate">{product.brand}</div>

        {/* 상품명 */}
        <div className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </div>

        {/* 쇼핑몰 이름 */}
        {product.storeName && (
          <div className="text-xs text-gray-400 truncate">
            {product.storeName}
          </div>
        )}

        {/* 별점 및 리뷰 수 */}
        {(product.rating || product.reviewCount) && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-600">
                {product.rating ? product.rating.toFixed(1) : '0.0'}
              </span>
            </div>
            {product.reviewCount && (
              <span className="text-xs text-gray-400">
                ({product.reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* 가격 영역 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">
              {product.price.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
