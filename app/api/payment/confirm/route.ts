import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

export async function POST(request: NextRequest) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
    const { paymentId, orderId } = await request.json()
    
    console.log('PortOne 결제 검증 요청:', { paymentId, orderId })

    // 임시로 mock 응답 반환 (실제 PortOne API 연동 전)
    const mockPayment = {
      id: paymentId,
      status: 'PAID', // 항상 성공으로 가정
      amount: { total: 40000 }, // 임시 금액
      currency: 'KRW',
    }

    console.log('PortOne 결제 상태 (Mock):', mockPayment)

    // 결제 상태 검증
    if (mockPayment.status === 'PAID') {
      // 결제 성공 시 DB 업데이트 (여기서는 로그만 출력)
      console.log('결제 검증 성공:', {
        paymentId,
        orderId,
        amount: mockPayment.amount.total,
        status: mockPayment.status
      })

      return NextResponse.json({
        success: true,
        paymentId,
        orderId,
        amount: mockPayment.amount.total,
        status: mockPayment.status
      })
    } else {
      console.log('결제 검증 실패:', mockPayment.status)
      return NextResponse.json(
        { success: false, error: '결제가 완료되지 않았습니다.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('PortOne 결제 검증 실패:', error)
    return NextResponse.json(
      { success: false, error: '결제 검증에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// GET 요청도 처리 (리다이렉트용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const orderId = searchParams.get('orderId')
    
    console.log('결제 확인 요청 (GET):', { paymentId, orderId })

    if (!paymentId || !orderId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/cart?error=payment_verification_failed`)
    }

    // 결제 성공으로 간주하고 주문 성공 페이지로 리다이렉트
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/orders/success?orderId=${orderId}`)
    
  } catch (error) {
    console.error('결제 확인 오류:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/cart?error=payment_verification_error`)
  }
}