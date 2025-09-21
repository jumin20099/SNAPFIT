import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { postIds, productIds, commentIds } = await request.json()
    
    if ((!postIds || !Array.isArray(postIds)) && 
        (!productIds || !Array.isArray(productIds)) && 
        (!commentIds || !Array.isArray(commentIds))) {
      return NextResponse.json({ error: 'At least one of postIds, productIds, or commentIds is required and must be an array' }, { status: 400 })
    }

    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // 백엔드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/reactions/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ postIds, productIds, commentIds })
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json({ error: 'Backend API error' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
