import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    
    const { userId } = params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const backendUrl = `${BACKEND_URL}/api/profiles/${userId}/follow`
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || '팔로우에 실패했습니다.' },
        { status: response.status }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('팔로우 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
