import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, totalAmount } = await request.json()
    
    // 백엔드에 결제 확인 요청
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': '00000000-0000-0000-0000-000000000001', // 임시 사용자 ID
      },
      body: JSON.stringify({ paymentId, totalAmount }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('결제 확인 오류:', response.status, errorText)
      return NextResponse.json(
        { error: `결제 확인에 실패했습니다. (${response.status})` },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('결제 확인 API 오류:', error)
    return NextResponse.json(
      { error: '결제 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}