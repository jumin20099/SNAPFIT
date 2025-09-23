'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SizeVariant } from '@/shared/types'
import { apiClient } from '@/shared/api/client'
import { AlertCircle, Package, Ruler, Info } from 'lucide-react'

interface SizeSectionProps {
  productId: number
  productName: string
}

export default function SizeSection({ 
  productId, 
  productName 
}: SizeSectionProps) {
  const [sizes, setSizes] = useState<SizeVariant[]>([])
  const [selectedSize, setSelectedSize] = useState<SizeVariant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSizeChart, setShowSizeChart] = useState(false)

  // 사이즈 정보 로드
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const sizesData = await apiClient.getProductSizes(productId, true) // 재고 있는 사이즈만
        setSizes(sizesData)
        
        // 첫 번째 사이즈를 기본 선택
        if (sizesData.length > 0) {
          setSelectedSize(sizesData[0])
        }
      } catch (err) {
        console.error('사이즈 정보 로드 실패:', err)
        setError('사이즈 정보를 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchSizes()
  }, [productId])

  // 사이즈 선택 핸들러
  const handleSizeSelect = (size: SizeVariant) => {
    setSelectedSize(size)
  }

  // 재고 상태에 따른 스타일 반환
  const getSizeButtonStyle = (size: SizeVariant) => {
    if (!size.inStock) {
      return "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
    }
    if (size.lowStock) {
      return "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
    }
    if (selectedSize?.sizeVariantId === size.sizeVariantId) {
      return "border-blue-500 bg-blue-50 text-blue-700"
    }
    return "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  }

  // 재고 상태 배지
  const getStockBadge = (size: SizeVariant) => {
    if (!size.inStock) {
      return <Badge variant="secondary" className="text-xs">품절</Badge>
    }
    if (size.lowStock) {
      return <Badge variant="destructive" className="text-xs">재고부족</Badge>
    }
    return <Badge variant="default" className="text-xs">재고있음</Badge>
  }

  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">사이즈 선택</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">사이즈 선택</h2>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 사이즈가 없는 경우
  if (sizes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">사이즈 선택</h2>
        </div>
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <Package className="h-5 w-5 text-gray-400" />
            <p className="text-gray-500">사이즈 정보가 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">사이즈 선택</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSizeChart(true)}
          className="flex items-center gap-2"
        >
          <Ruler className="h-4 w-4" />
          사이즈 가이드
        </Button>
      </div>

      {/* 선택된 사이즈 정보 */}
      {selectedSize && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">
                  선택된 사이즈: {selectedSize.sizeLabel}
                </h3>
                {selectedSize.sizeValue && (
                  <p className="text-sm text-blue-700">
                    {selectedSize.sizeValue}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStockBadge(selectedSize)}
                <span className="text-sm text-blue-700">
                  재고 {selectedSize.availableStock}개
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 사이즈 선택 버튼들 */}
      <div className="space-y-4">
        <h3 className="font-medium">사이즈를 선택해주세요</h3>
        <div className="grid grid-cols-4 gap-3">
          {sizes.map((size) => (
            <Button
              key={size.sizeVariantId}
              variant="outline"
              className={`h-12 flex flex-col items-center justify-center gap-1 ${getSizeButtonStyle(size)}`}
              onClick={() => handleSizeSelect(size)}
              disabled={!size.inStock}
            >
              <span className="font-medium">{size.sizeLabel}</span>
              {size.lowStock && (
                <span className="text-xs">재고부족</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* 재고 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            재고 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sizes.map((size) => (
              <div key={size.sizeVariantId} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="font-medium w-12">{size.sizeLabel}</span>
                  {size.sizeValue && (
                    <span className="text-sm text-gray-500">({size.sizeValue})</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {getStockBadge(size)}
                  <span className="text-sm text-gray-600">
                    {size.availableStock}개
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 사이즈 가이드 모달 (간단한 버전) */}
      {showSizeChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>사이즈 가이드</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSizeChart(false)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Info className="h-4 w-4" />
                  <span>정확한 사이즈를 선택하기 위해 측정해보세요</span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>• 가슴둘레: 겨드랑이 아래 가장 넓은 부분</p>
                  <p>• 허리둘레: 배꼽 위치의 가장 좁은 부분</p>
                  <p>• 총장: 어깨끝에서 아래쪽 끝까지</p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => setShowSizeChart(false)}
                >
                  확인
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
