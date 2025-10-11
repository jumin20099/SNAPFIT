import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

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

    const postId = params.id
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    
    // 백엔드 Redis API로 조회수 증가 요청 전달
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 쿠키 전달을 위해 credentials 추가
      credentials: 'include',
    })
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      console.error('조회수 증가 실패:', response.status)
      return NextResponse.json(
        { success: false, error: '조회수 증가 실패' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('조회수 증가 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류' },
      { status: 500 }
    )
  }
}
