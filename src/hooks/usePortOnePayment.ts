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

      // 1. 서버에서 PortOne 결제 생성
      const createResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: paymentData.orderId,
          amount: paymentData.totalAmount,
          orderName: paymentData.orderName,
        }),
      })

      if (!createResponse.ok) {
        throw new Error('결제 생성에 실패했습니다.')
      }

      const { clientSecret, paymentId } = await createResponse.json()
      console.log('PortOne 결제 생성 완료:', { paymentId, clientSecret })

      // 2. PortOne 결제창 호출 (v2 SDK)
      const response = await requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId: paymentId, // 서버에서 받은 paymentId 사용
        orderName: paymentData.orderName,
        totalAmount: paymentData.totalAmount,
        currency: 'KRW',
        payMethod: 'EASY_PAY',
        easyPay: {
          method: 'KAKAOPAY'
        },
        confirmUrl: `${window.location.origin}/orders/success?orderId=${paymentData.orderId}`,
        cancelUrl: `${window.location.origin}/cart`,
        failUrl: `${window.location.origin}/cart?error=payment_failed`,
        windowType: {
          type: 'POPUP'
        },
        customizations: {
          colors: {
            primary: '#3C1E1E',
          },
        },
      } as any)

      console.log('PortOne 결제 응답:', response)

      // PortOne v2 SDK는 response.code가 아닌 다른 방식으로 응답 처리
      if (response && response.paymentId && response.paymentToken) {
        // 결제 성공으로 간주 (실제로는 PortOne이 confirmUrl로 리다이렉트할 것)
        console.log('PortOne 결제 성공:', {
          paymentId: response.paymentId,
          paymentToken: response.paymentToken,
          txId: response.txId
        })

        // 서버 검증 (선택적)
        try {
          const confirmResponse = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId: response.paymentId,
              orderId: paymentData.orderId,
            }),
          })

          if (confirmResponse.ok) {
            const confirmResult = await confirmResponse.json()
            console.log('PortOne 결제 검증 완료:', confirmResult)
          }
        } catch (error) {
          console.warn('결제 검증 실패 (무시):', error)
        }

        // 결제 성공 후 성공 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = `/orders/success?orderId=${paymentData.orderId}`
        }, 1000)

        return {
          success: true,
          paymentId: response.paymentId,
        }
      } else {
        return {
          success: false,
          error: '결제에 실패했습니다.',
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
