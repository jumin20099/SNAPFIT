import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 백엔드 API 호출
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
    const response = await fetch(`${API_BASE_URL}/api/likes/my`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: '좋아요 목록을 가져오는데 실패했습니다.' }, { status: response.status })
    }

    const data = await response.json()
    // 백엔드에서 Like 엔티티 리스트를 내려주므로 PRODUCT 타입만 골라 productId 배열로 변환해서 반환
    const productIds: number[] = Array.isArray(data)
      ? data
          .filter((like: any) => like?.targetType === 'PRODUCT')
          .map((like: any) => like?.targetIdx)
          .filter((id: any) => typeof id === 'number')
      : []
    return NextResponse.json(productIds)
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
} 