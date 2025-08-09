import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    const authHeader =
      request.headers.get('authorization') || request.headers.get('Authorization') || ''

    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'GET',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      // 백엔드 결과 최신 반영
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('백엔드 상품 상세 정보 가져오기 실패:', response.status, response.statusText)
      return NextResponse.json(
        { error: '상품 정보를 가져오는데 실패했습니다.' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('상품 상세 정보 가져오기 에러:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}