import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 토큰 읽기 (SSR에서 사용)
    const cookieStore = cookies()
    const cookieToken = cookieStore.get('auth_token')?.value
    
    // 헤더에서 토큰 읽기 (클라이언트에서 사용)
    const headerToken = request.headers.get('authorization') || request.headers.get('Authorization') || ''
    
    // 쿠키 토큰이 있으면 사용, 없으면 헤더 토큰 사용
    const authToken = cookieToken || headerToken.replace('Bearer ', '')

    // 요청 본문에서 postId 추출
    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ error: 'postId가 필요합니다.' }, { status: 400 })
    }

    // 백엔드 API 호출
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
    const response = await fetch(`${API_BASE_URL}/api/scraps/toggle?postId=${postId}`, {
      method: 'POST',
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 전달을 위해 필요
    })

    if (!response.ok) {
      return NextResponse.json({ error: '스크랩 토글에 실패했습니다.' }, { status: response.status })
    }

    const data = await response.json()
    // 백엔드 응답을 그대로 반환
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
