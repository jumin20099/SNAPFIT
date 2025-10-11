import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateCsrfToken } from '@/lib/csrf-utils'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    // 쿠키에서 토큰 읽기 (SSR에서 사용)
    const cookieStore = cookies()
    const cookieToken = cookieStore.get('auth_token')?.value
    console.log('상품 상세 API - 쿠키 토큰:', cookieToken ? '존재함' : '없음')
    
    // 헤더에서 토큰 읽기 (클라이언트에서 사용)
    const headerToken = request.headers.get('authorization') || request.headers.get('Authorization') || ''
    console.log('상품 상세 API - 헤더 토큰:', headerToken ? '존재함' : '없음')
    
    // 쿠키 토큰이 있으면 사용, 없으면 헤더 토큰 사용
    const authToken = cookieToken || headerToken.replace('Bearer ', '')
    console.log('상품 상세 API - 최종 사용 토큰:', authToken ? '존재함' : '없음')

    const url = `${API_BASE_URL}/api/products/${productId}?skipIncrement=true`
    const maxAttempts = 3
    let lastErr: any = null
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          credentials: 'include', // 쿠키 전달을 위해 필요
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
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    const productId = params.id
    const API = process.env.API_BASE_URL || 'http://localhost:8080'
    let anon = request.cookies.get('anon')?.value || ''
    if (!anon) {
      // 익명 ID 발급 (서명 없이 UUID, httpOnly 쿠키로 저장)
      anon = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string
    }
    const res = await fetch(`${API}/api/products/${productId}/view`, {
      method: 'POST',
      headers: {
        ...(anon ? { 'X-Anon-Id': anon } : {}),
      },
      cache: 'no-store',
    })
    const body = await res.text()
    const nextRes = new NextResponse(body, { status: res.status })
    // anon 쿠키가 없었다면 발급한 값 저장
    if (!request.cookies.get('anon')?.value && anon) {
      nextRes.cookies.set('anon', anon, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1년
      })
    }
    return nextRes
  } catch (error) {
    console.error('상품 조회수 증가 에러:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}