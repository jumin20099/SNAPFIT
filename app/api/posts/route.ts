import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const size = searchParams.get('size') || '20'
    const page = searchParams.get('page') || '0'
    const sort = searchParams.get('sort') || 'createdAt'
    
    // 백엔드 API 호출
    const backendUrl = `${BACKEND_URL}/api/posts?size=${size}&page=${page}&sort=${sort}`
    
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
    console.error('Posts API error:', error)
    return NextResponse.json(
      { error: '게시글을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization') // Authorization 헤더 추출
    
    // 백엔드 API 호출
    const backendUrl = `${BACKEND_URL}/api/posts`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authHeader) { // Authorization 헤더가 있으면 추가
      headers['Authorization'] = authHeader
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('Create post API error:', error)
    return NextResponse.json(
      { error: '게시글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
