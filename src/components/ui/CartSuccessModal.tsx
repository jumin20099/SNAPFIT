"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShoppingCart, CheckCircle, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface CartSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productImage: string
  productPrice: number
}

export default function CartSuccessModal({
  isOpen,
  onClose,
  productName,
  productImage,
  productPrice
}: CartSuccessModalProps) {
  const router = useRouter()

  const handleContinueShopping = () => {
    onClose()
  }

  const handleGoToCart = () => {
    router.push('/cart')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            장바구니에 상품이 추가되었습니다!
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {/* 성공 아이콘 */}
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          {/* 상품 정보 */}
          <div className="flex items-center space-x-4 w-full">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={productImage || '/placeholder.svg'}
                alt={productName}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {productName}
              </h3>
              <p className="text-sm text-gray-500">
                {productPrice.toLocaleString()}원
              </p>
            </div>
          </div>
          
          {/* 버튼들 */}
          <div className="flex space-x-3 w-full">
            <Button
              variant="outline"
              onClick={handleContinueShopping}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              계속 쇼핑하기
            </Button>
            <Button
              onClick={handleGoToCart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              장바구니로 가기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
