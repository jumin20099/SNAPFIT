import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// 댓글 좋아요 토글
export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    // 백엔드 API 호출
    const backendUrl = `${BACKEND_URL}/api/comments/${params.commentId}/like`
    
    const response = await fetch(backendUrl, {
      method: 'POST',
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
    console.error('Toggle comment like API error:', error)
    return NextResponse.json(
      { error: '댓글 좋아요 토글 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
