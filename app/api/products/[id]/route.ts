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

    const url = `${API_BASE_URL}/api/products/${productId}`
    const maxAttempts = 3
    let lastErr: any = null
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          return NextResponse.json(data)
        }
        lastErr = new Error(`status ${response.status}`)
      } catch (e) {
        lastErr = e
      }
      // 지수 백오프 150ms/300ms
      await new Promise((r) => setTimeout(r, 150 * attempt))
    }
    console.error('백엔드 상품 상세 정보 가져오기 실패(재시도 모두 실패):', lastErr)
    return NextResponse.json(
      { error: '상품 정보를 가져오는데 실패했습니다.' },
      { status: 502 }
    )
  } catch (error) {
    console.error('상품 상세 정보 가져오기 에러:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const API = process.env.API_BASE_URL || 'http://localhost:8080'
    const anon = request.cookies.get('anon')?.value
    const res = await fetch(`${API}/api/products/${productId}/view`, {
      method: 'POST',
      headers: {
        ...(anon ? { 'X-Anon-Id': anon } : {}),
      },
      cache: 'no-store',
    })
    const body = await res.text()
    return new NextResponse(body, { status: res.status })
  } catch (error) {
    console.error('상품 조회수 증가 에러:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}