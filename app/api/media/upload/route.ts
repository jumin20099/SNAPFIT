import { NextRequest } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

export async function POST(req: NextRequest) {
  // CSRF 토큰 검증
  const isValidCsrf = await validateCsrfToken(req)
  if (!isValidCsrf) {
    return new Response(
      JSON.stringify({ error: 'CSRF 토큰이 유효하지 않습니다' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    )
  }

  const authHeader = req.headers.get('authorization') || ''
  const formData = await req.formData()

  const backendRes = await fetch(`${API_BASE}/api/media/upload`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
    },
    body: formData as any,
  })

  const contentType = backendRes.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await backendRes.json()
    : await backendRes.text()

  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    { status: backendRes.status, headers: { 'content-type': contentType } }
  )
}