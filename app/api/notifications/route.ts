import { NextRequest } from 'next/server'
import { extractBearerToken } from '@/api/_utils/auth'

// 절대 경로로 변경
const BACKEND = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req)
  
  // 토큰이 없어도 백엔드로 요청을 보내서 빈 알림 목록을 받을 수 있도록 함
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const res = await fetch(`${BACKEND}/api/notifications`, {
    headers,
    cache: 'no-store',
  })
  
  const body = await res.text()
  return new Response(body, { 
    status: res.status, 
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' } 
  })
}

export async function DELETE(req: NextRequest) {
  const token = extractBearerToken(req)
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
