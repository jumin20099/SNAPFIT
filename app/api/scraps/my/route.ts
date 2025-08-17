import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 토큰 읽기 (SSR에서 사용)
    const cookieStore = cookies()
    const cookieToken = cookieStore.get('auth_token')?.value
    
    // 헤더에서 토큰 읽기 (클라이언트에서 사용)
    const headerToken = request.headers.get('authorization') || request.headers.get('Authorization') || ''
    
    // 쿠키 토큰이 있으면 사용, 없으면 헤더 토큰 사용
    const authToken = cookieToken || headerToken.replace('Bearer ', '')

    // 백엔드 API 호출
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
    const response = await fetch(`${API_BASE_URL}/api/scraps/my`, {
      method: 'GET',
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      credentials: 'include', // 쿠키 전달을 위해 필요
    })

    if (!response.ok) {
      return NextResponse.json({ error: '스크랩 목록을 가져오는데 실패했습니다.' }, { status: response.status })
    }

    const data = await response.json()
    // 스크랩된 게시글 ID 목록을 반환
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
