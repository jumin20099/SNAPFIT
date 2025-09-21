import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// 댓글 작성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, content, parentId } = body

    // Authorization 헤더 추출
    const authHeader = request.headers.get('authorization')
    
    // 백엔드 API 호출
    const backendUrl = `${BACKEND_URL}/api/comments/posts/${postId}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Authorization 헤더가 있으면 추가
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content,
        parentId: parentId || null
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Create comment API error:', error)
    return NextResponse.json(
      { error: '댓글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
