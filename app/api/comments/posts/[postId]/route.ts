import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// 게시글의 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '20'
    const sortBy = searchParams.get('sortBy') || 'time'

    // 백엔드 API 호출
    const backendUrl = `${BACKEND_URL}/api/comments/posts/${params.postId}?page=${page}&size=${size}&sortBy=${sortBy}`
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
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
