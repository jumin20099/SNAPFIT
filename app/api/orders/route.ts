import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = request.headers.get('authorization')
    
    console.log('Next.js API 라우트 - 주문 생성 요청:', {
      token: token ? token.substring(0, 20) + '...' : 'null',
      body
    })

    // 백엔드로 프록시
    const response = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('백엔드 응답 오류:', response.status, errorText)
      return NextResponse.json(
        { error: '주문 생성에 실패했습니다.' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Next.js API 라우트 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}