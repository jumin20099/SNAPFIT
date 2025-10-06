import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    // 인증 토큰 가져오기
    const token = request.headers.get('authorization')
    
    // 요청 본문에서 비밀번호 추출
    const body = await request.json().catch(() => ({}))
    const { password } = body
    
    // 백엔드 API 호출
    const backendUrl = `${BACKEND_URL}/api/comments/${params.commentId}${password ? `?password=${encodeURIComponent(password)}` : ''}`
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete comment API error:', error)
    return NextResponse.json(
      { error: '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
