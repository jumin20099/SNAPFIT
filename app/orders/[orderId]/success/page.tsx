'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle, Home, ShoppingBag } from 'lucide-react'

interface OrderSuccessData {
  orderId: string
  totalAmount: number
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
  customerName: string
  paymentMethod: string
  paidAt: string
}

export default function OrderSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderSuccessData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 실제로는 주문 ID로 주문 정보를 가져와야 함
    // 현재는 모의 데이터 사용
    setTimeout(() => {
      setOrderData({
        orderId: params.orderId as string,
        totalAmount: 50000,
        items: [
          { productName: '상품명', quantity: 1, price: 50000 }
        ],
        customerName: '고객명',
        paymentMethod: '카카오페이',
        paidAt: new Date().toLocaleString()
      })
      setLoading(false)
    }, 1000)
  }, [params.orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">주문 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* 성공 아이콘 */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">주문이 완료되었습니다!</h1>
          <p className="text-gray-600">카카오페이 결제가 성공적으로 처리되었습니다.</p>
        </div>

        {/* 주문 정보 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">주문 정보</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">주문번호</span>
              <span className="font-medium">{orderData.orderId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">결제수단</span>
              <span className="font-medium">{orderData.paymentMethod}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">결제일시</span>
              <span className="font-medium">{orderData.paidAt}</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-gray-900">{orderData.totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 주문 상품 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">주문 상품</h2>
          
          <div className="space-y-3">
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                </div>
                <p className="font-medium">{item.price.toLocaleString()}원</p>
              </div>
            ))}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">주문 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 주문 확인 이메일이 발송되었습니다.</li>
            <li>• 상품 준비 및 배송은 1-2일 소요됩니다.</li>
            <li>• 문의사항이 있으시면 고객센터로 연락해주세요.</li>
          </ul>
        </div>

        {/* 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            홈으로 가기
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            쇼핑 계속하기
          </button>
        </div>
      </div>
    </div>
  )
}
