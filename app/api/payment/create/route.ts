import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, orderName } = await request.json()
    
    console.log('PortOne 결제 생성 요청:', { orderId, amount, orderName })

    // 임시로 mock 응답 반환 (실제 PortOne API 연동 전)
    const mockPayment = {
      id: `payment_${orderId}_${Date.now()}`,
      clientSecret: `secret_${orderId}_${Date.now()}`,
      status: 'READY',
      amount: { total: amount },
      currency: 'KRW',
    }

    console.log('PortOne 결제 생성 완료 (Mock):', mockPayment)

    return NextResponse.json({
      success: true,
      clientSecret: mockPayment.clientSecret,
      paymentId: mockPayment.id,
    })
  } catch (error) {
    console.error('PortOne 결제 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: '결제 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
