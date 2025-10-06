import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'time'
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '20'

    // Authorization 헤더 추출
    const authHeader = request.headers.get('authorization')
    
    // 클라이언트 IP 가져오기
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    
    // 백엔드 API 호출
    const backendUrl = `${BACKEND_URL}/api/comments/posts/${params.postId}?sortBy=${sortBy}&page=${page}&size=${size}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Authorization 헤더가 있으면 추가
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // IP 헤더 추가
    if (forwardedFor) {
      headers['X-Forwarded-For'] = forwardedFor
    }
    if (realIp) {
      headers['X-Real-IP'] = realIp
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error:', response.status, errorText)
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Get comments API error:', error)
    return NextResponse.json(
      { error: '댓글 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}