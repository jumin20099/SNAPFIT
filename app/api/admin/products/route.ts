import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 백엔드 API 호출
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`백엔드 API 오류: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('어드민 상품 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '상품 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
