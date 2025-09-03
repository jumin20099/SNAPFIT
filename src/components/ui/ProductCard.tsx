'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discountRate?: number
  imageUrl: string
  badges?: string[]
  rating?: number
  reviewCount?: number
  shipping?: string
}

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

        {/* 좌상단 뱃지들 */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badges.slice(0, 2).map((badge, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-1 angular-rounded text-white font-medium ${
                  badge.includes('쿠폰') || badge.includes('할인')
                    ? 'bg-red-500'
                    : badge.includes('무료배송')
                    ? 'bg-blue-500'
                    : 'bg-gray-600'
                }`}
              >
                {badge}
              </span>
            ))}
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

        {/* 가격 영역 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {product.discountRate && (
              <span className="text-sm font-bold text-red-500">
                {product.discountRate}%
              </span>
            )}
            <span className="text-base font-bold text-gray-900">
              {product.price.toLocaleString()}원
            </span>
          </div>
          {product.originalPrice && (
            <div className="text-xs text-gray-400 line-through">
              {product.originalPrice.toLocaleString()}원
            </div>
          )}
        </div>

        {/* 메타 정보 */}
        <div className="text-xs text-gray-500">
          {product.rating && product.reviewCount ? (
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span>{product.rating}</span>
              <span>(리뷰 {product.reviewCount.toLocaleString()})</span>
            </div>
          ) : product.shipping ? (
            <span>{product.shipping}</span>
          ) : (
            <span>오늘출발</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
