import { useState, useCallback } from 'react'
import { requestPayment } from '@portone/browser-sdk/v2'

interface PaymentRequest {
  orderId: string
  orderName: string
  totalAmount: number
  items: Array<{
    productId: number
    productName: string
    quantity: number
    price: number
  }>
}

interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
}

export function usePortOnePayment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestPaymentCallback = useCallback(async (paymentData: PaymentRequest): Promise<PaymentResult> => {
    try {
      setIsLoading(true)
      setError(null)

      // 결제 요청
      const response = await requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId: `order_${paymentData.orderId}_${Date.now()}`,
        orderName: paymentData.orderName,
        totalAmount: paymentData.totalAmount,
        currency: 'KRW',
        payMethod: 'KAKAOPAY', // 카카오페이 결제
        // 카카오페이는 사용자 정보를 자동으로 가져오므로 customer 정보 제거
        confirmUrl: `${window.location.origin}/api/payment/confirm`,
        cancelUrl: `${window.location.origin}/cart`,
        failUrl: `${window.location.origin}/cart?error=payment_failed`,
        windowType: 'POPUP', // 팝업으로 결제 진행
        customizations: {
          colors: {
            primary: '#3C1E1E', // 브랜드 컬러
          },
        },
      })

      if (response.code === 'PAYMENT_SUCCESS') {
        return {
          success: true,
          paymentId: response.paymentId,
        }
      } else {
        return {
          success: false,
          error: response.message || '결제에 실패했습니다.',
        }
      }
    } catch (error) {
      console.error('결제 요청 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '결제 중 오류가 발생했습니다.'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    requestPayment: requestPaymentCallback,
    isLoading,
    error,
  }
}
