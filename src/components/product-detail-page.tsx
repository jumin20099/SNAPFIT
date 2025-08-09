"use client"

import { useState } from 'react'
import { ArrowLeft, Heart, Share2, ShoppingCart, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

interface ProductDetailPageProps {
  product: Product
  onBack: () => void
  onAddToCody: (product: Product) => void
  onToggleLike: (productIdx: number) => void
}

export default function ProductDetailPage({ 
  product, 
  onBack, 
  onAddToCody, 
  onToggleLike 
}: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  
  // 여러 이미지가 있다고 가정 (실제로는 product.images 배열이 있을 것)
  const images = [product.productImage, product.productImage, product.productImage]

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onBack()
          }} 
          className="p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">상품 상세</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleLike(product.productIdx)
            }}
            className="p-2 hover:bg-gray-100"
          >
            <Heart className={`w-5 h-5 ${product.liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-gray-100"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* 이미지 갤러리 */}
        <div className="relative">
          <img
            src={images[selectedImage]}
            alt={product.productName}
            className="w-full h-80 object-cover"
          />
          
          {/* 이미지 인디케이터 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === selectedImage ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="p-4 space-y-6">
          {/* 상품명과 가격 */}
          <div>
            <h2 className="text-xl font-bold mb-2">{product.productName}</h2>
            <p className="text-2xl font-bold text-blue-600">
              ₩{product.productPrice?.toLocaleString()}
            </p>
          </div>

          {/* 카테고리 정보 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{product.majorCategory}</Badge>
            {product.subCategory && (
              <Badge variant="outline">{product.subCategory}</Badge>
            )}
            {product.storeName && (
              <Badge variant="outline">{product.storeName}</Badge>
            )}
          </div>

          {/* 상품 설명 */}
          <div>
            <h3 className="font-semibold mb-2">상품 설명</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.productContent || '상품 설명이 없습니다.'}
            </p>
          </div>

          {/* 구매 링크 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">구매 링크</p>
                  <p className="text-sm text-gray-600">제휴몰에서 구매하기</p>
                </div>
                <Button variant="outline" size="sm">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  구매하기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 상품 상세 정보 */}
          <div>
            <h3 className="font-semibold mb-3">상품 상세 정보</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">브랜드</span>
                <span className="font-medium">{product.storeName || '브랜드명'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">카테고리</span>
                <span className="font-medium">{product.majorCategory} {product.subCategory && `> ${product.subCategory}`}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">상품 번호</span>
                <span className="font-medium">{product.productIdx}</span>
              </div>
            </div>
          </div>

          {/* 관련 상품 추천 */}
          <div>
            <h3 className="font-semibold mb-3">함께 코디하기 좋은 상품</h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="cursor-pointer">
                  <CardContent className="p-3">
                    <img
                      src={product.productImage}
                      alt="추천 상품"
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <h4 className="text-sm font-medium truncate">추천 상품 {item}</h4>
                    <p className="text-xs text-gray-600">₩29,900</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 추가 정보 섹션 */}
          <div>
            <h3 className="font-semibold mb-3">추가 정보</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">배송 정보</h4>
                <p className="text-sm text-gray-600">무료배송 (3-5일 소요)</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">교환/반품</h4>
                <p className="text-sm text-gray-600">7일 이내 무료 교환/반품 가능</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">상품 문의</h4>
                <p className="text-sm text-gray-600">고객센터: 1588-0000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 플로팅 액션 버튼 */}
      <div className="p-4 border-t bg-white">
        <Button 
          className="w-full h-12 text-lg font-semibold"
          onClick={() => onAddToCody(product)}
        >
          <Plus className="w-5 h-5 mr-2" />
          코디에 추가
        </Button>
      </div>
    </div>
  )
} 