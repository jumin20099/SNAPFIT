import { NextRequest } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'
import { BACKEND, passThroughHeaders } from '../../_utils/proxy'

export const dynamic = 'force-dynamic'

// 임시로 여기에 토큰 추출 함수 정의
function extractTokenFromRequest(req: NextRequest): string | null {
  // 1) 클라이언트가 보낸 Authorization
  const h = req.headers.get('authorization')
  if (h?.startsWith('Bearer ')) return h.slice(7)

  // 2) 서버측 쿠키(권장: HTTP-Only로 세팅)
  const fromCookie = req.cookies.get('token')?.value // 'access_token'에서 'token'으로 변경
  if (fromCookie) return fromCookie

  // 3) (임시) 쿼리파라미터 토큰 - SSE 등
  const fromQuery = req.nextUrl.searchParams.get('token')
  return fromQuery
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
    const token = extractTokenFromRequest(req)
    if (!token) {
      return new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: 'Missing access token' }), { status: 401 })
    }

    const response = await fetch(`${BACKEND}/api/notifications/${params.id}`, {
      method: 'PUT',
      headers: { ...passThroughHeaders(req), Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: '알림 읽음 처리에 실패했습니다' }), { status: response.status })
    }

    return new Response(JSON.stringify({ message: '알림을 읽음 처리했습니다' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error)
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다' }), { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
    const token = extractTokenFromRequest(req)
    if (!token) {
      return new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: 'Missing access token' }), { status: 401 })
    }

    const response = await fetch(`${BACKEND}/api/notifications/${params.id}`, {
      method: 'DELETE',
      headers: { ...passThroughHeaders(req), Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: '알림 삭제에 실패했습니다' }), { status: response.status })
    }

    return new Response(JSON.stringify({ message: '알림이 삭제되었습니다' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('알림 삭제 오류:', error)
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다' }), { status: 500 })
  }
}
