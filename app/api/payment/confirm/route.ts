import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const pgToken = searchParams.get('pg_token')
    
    console.log('결제 확인 요청:', { paymentId, pgToken })

    // paymentId가 없으면 기본 주문 완료 페이지로 리다이렉트
    if (!paymentId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/orders/success`)
    }

    // 간단한 결제 성공 처리 (실제 운영에서는 PortOne API로 검증 필요)
    console.log('결제 성공 처리:', { paymentId, pgToken })

    // 결제 성공 시 주문 완료 페이지로 리다이렉트
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/orders/${paymentId}/success`)
    
  } catch (error) {
    console.error('결제 확인 오류:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/cart?error=payment_verification_error`)
  }
}