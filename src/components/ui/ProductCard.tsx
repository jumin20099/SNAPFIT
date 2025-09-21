'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LikeButton } from '@/features/reactions/LikeButton'
import type { Product } from '@/shared/types'

interface ProductCardProps {
  product: Product
  onLike?: (productId: string) => void
  onClick?: () => void
  variant?: 'grid' | 'list'
}

export function ProductCard({ product, onLike, onClick, variant = 'grid' }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const router = useRouter()

  const handleProductClick = () => {
    if (onClick) {
      onClick()
    } else {
      const productId = product.id || product.productIdx || product.product_id || product.product_idx
      console.log('상품 ID 필드들:', {
        id: product.id,
        productIdx: product.productIdx,
        product_id: product.product_id,
        product_idx: product.product_idx,
        최종_ID: productId
      })
      if (productId) {
        router.push(`/products/${productId}`)
      } else {
        console.error('상품 ID를 찾을 수 없습니다:', product)
      }
    }
  }

  return (
    <motion.div
      className="bg-white overflow-hidden shadow-sm cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      onClick={handleProductClick}
    >
      {/* 상품 이미지 */}
      <div className="relative aspect-square bg-gray-100">
        {!imageError ? (
          <img
            src={product.productImage || product.imageUrl || product.product_image}
            alt={`${product.brand || product.storeName || product.store_name} ${product.productName || product.name || product.product_name}`}
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



        {/* 우상단 좋아요 버튼 */}
        <div 
          className="absolute top-2 right-2"
          onClick={(e) => e.stopPropagation()}
        >
          <LikeButton
            targetIdx={product.productIdx || parseInt(product.id) || 0}
            targetType="product"
            initialActive={product.isLiked || product.likedByUser || false}
            initialCount={product.likeCount || product.likesCount || 0}
            className="w-8 h-8 flex items-center justify-center"
          />
        </div>
      </div>

      {/* 상품 정보 */}
      <div className="p-2 space-y-1">
        {/* 브랜드명 */}
        <div className="text-xs text-gray-500 truncate">{product.brand || product.storeName || product.store_name}</div>

        {/* 상품명 */}
        <div className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
          {product.productName || product.name || product.product_name}
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
                {product.rating && typeof product.rating === 'number' ? product.rating.toFixed(1) : '0.0'}
              </span>
            </div>
            {product.reviewCount && product.reviewCount > 0 && (
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
              {(product.price || product.productPrice || product.product_price || 0).toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
