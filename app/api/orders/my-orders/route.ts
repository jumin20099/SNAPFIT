import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 백엔드로 주문 내역 조회 요청
    const response = await fetch('http://localhost:8080/api/orders/my-orders', {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('백엔드 주문 내역 조회 오류:', response.status, errorText)
      return NextResponse.json(
        { error: '주문 내역 조회에 실패했습니다.' },
        { status: response.status }
      )
    }

    const orders = await response.json()
    return NextResponse.json(orders)
  } catch (error) {
    console.error('주문 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '내부 서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
