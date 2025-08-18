import { NextRequest } from 'next/server'

// 절대 경로로 변경
const BACKEND = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // EventSource는 헤더를 못 보내므로 쿠키/쿼리에서 추출 후 서버→백엔드로 Authorization으로 변환
  const token = extractTokenFromRequest(req)
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const backendResp = await fetch(`${BACKEND}/api/notifications/stream`, {
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
      // Last-Event-ID 전달 필요 시:
      ...(req.headers.get('last-event-id') ? { 'Last-Event-ID': req.headers.get('last-event-id')! } : {}),
    },
    // Node의 fetch는 기본적으로 스트림을 지원
  })

  if (!backendResp.ok || !backendResp.body) {
    return new Response('Upstream error', { status: backendResp.status })
  }

  const headers = new Headers()
  headers.set('Content-Type', 'text/event-stream')
  headers.set('Cache-Control', 'no-cache, no-transform')
  headers.set('Connection', 'keep-alive')
  headers.set('X-Accel-Buffering', 'no')

  return new Response(backendResp.body, { status: 200, headers })
}

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
