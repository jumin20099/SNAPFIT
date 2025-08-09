"use client"

import { Heart, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { formatCurrencyKRW } from '@/lib/utils'

interface Product {
  productIdx: number
  productName: string
  productContent: string
  productPrice: number
  productImage: string
  majorCategory: string
  subCategory: string
  storeName?: string
  liked?: boolean
}

interface ProductCardProps {
  product: Product
  onViewDetail: (product: Product) => void
  onAddToCody: (product: Product) => void
  onToggleLike: (productIdx: number) => void
  compact?: boolean
}

export default function ProductCard({ 
  product, 
  onViewDetail, 
  onAddToCody, 
  onToggleLike,
  compact = false 
}: ProductCardProps) {
  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardContent className={`p-3 ${compact ? '' : 'pb-4'}`}>
        {/* 상품 이미지 */}
        <a href={`/products/${product.productIdx}`} className="block mb-3" aria-label={`${product.productName} 상세로 이동`}>
          <div className="relative w-full h-48">
            <Image
              src={product.productImage || "/placeholder.svg"}
              alt={product.productName}
              fill
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 320px"
              className="object-cover rounded"
            />
          </div>
        </a>
          
          {/* 좋아요 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-1 h-8 w-8 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation()
              onToggleLike(product.productIdx)
            }}
          >
            <Heart
              className={`w-4 h-4 ${product.liked ? 'text-red-500' : 'text-gray-400'}`}
              fill={product.liked ? 'currentColor' : 'none'}
            />
          </Button>
        

        {/* 상품 정보 */}
        <div className="space-y-3">
          <a href={`/products/${product.productIdx}`} className="block">
            <h3 className="font-medium text-base line-clamp-2 leading-tight">
              {product.productName}
            </h3>
          </a>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrencyKRW(product.productPrice)}
          </p>
          
                  {/* 액션 버튼들 */}
        <div className="flex flex-col gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className={`w-full ${compact ? 'h-8 text-xs' : 'h-10 text-sm'}`}
            onClick={() => onViewDetail(product)}
          >
            <Eye className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            {compact ? '상세보기' : '상세보기'}
          </Button>
          <Button
            size="sm"
            className={`w-full ${compact ? 'h-8 text-xs' : 'h-10 text-sm'}`}
            onClick={() => onAddToCody(product)}
          >
            <Plus className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            {compact ? '코디 추가' : '코디 추가'}
          </Button>
        </div>
        </div>
      </CardContent>
    </Card>
  )
} 