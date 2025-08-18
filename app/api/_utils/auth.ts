// Next.js 14 App Router
import type { NextRequest } from 'next/server'

export function extractAccessToken(req: NextRequest): string | null {
  // 1) 클라이언트가 보낸 Authorization
  const h = req.headers.get('authorization')
  if (h?.startsWith('Bearer ')) return h.slice(7)

  // 2) 서버측 쿠키(권장: HTTP-Only로 세팅)
  const fromCookie = req.cookies.get('access_token')?.value
  if (fromCookie) return fromCookie

  // 3) (임시) 쿼리파라미터 토큰 - SSE 등
  const fromQuery = req.nextUrl.searchParams.get('token')
  return fromQuery
}
