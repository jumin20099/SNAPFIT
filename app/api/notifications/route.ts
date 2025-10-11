import { NextRequest } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

// 절대 경로로 변경
const BACKEND = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = extractTokenFromRequest(req)
  if (!token) {
    return new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: 'Missing access token' }), { status: 401 })
  }
  
  const res = await fetch(`${BACKEND}/api/notifications`, {
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    cache: 'no-store',
  })
  
  const body = await res.text()
  return new Response(body, { 
    status: res.status, 
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' } 
  })
}

export async function DELETE(req: NextRequest) {
  const token = extractTokenFromRequest(req)
  if (!token) {
    return new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: 'Missing access token' }), { status: 401 })
  }
  
  const res = await fetch(`${BACKEND}/api/notifications`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    cache: 'no-store',
  })
  
  if (!res.ok) {
    return new Response(JSON.stringify({ error: '알림 삭제에 실패했습니다' }), { status: res.status })
  }
  
  return new Response(JSON.stringify({ message: '모든 알림이 삭제되었습니다' }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

// 임시로 여기에 토큰 추출 함수 정의
function extractTokenFromRequest(req: NextRequest): string | null {
  // 1) 클라이언트가 보낸 Authorization
  const h = req.headers.get('authorization')
  if (h?.startsWith('Bearer ')) return h.slice(7)

  // 2) 서버측 쿠키(권장: HTTP-Only로 세팅)
  const fromCookie = req.cookies.get('access_token')?.value // AuthController에서 발급하는 쿠키 이름
  if (fromCookie) return fromCookie

  // 3) (임시) 쿼리파라미터 토큰 - SSE 등
  const fromQuery = req.nextUrl.searchParams.get('token')
  return fromQuery
}
