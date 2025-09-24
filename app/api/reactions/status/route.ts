import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { postIds, productIds, commentIds } = await request.json()
    
    if ((!postIds || !Array.isArray(postIds)) && 
        (!productIds || !Array.isArray(productIds)) && 
        (!commentIds || !Array.isArray(commentIds))) {
      return NextResponse.json({ error: 'At least one of postIds, productIds, or commentIds is required and must be an array' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    // 백엔드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }
    if (forwardedFor) {
      headers['X-Forwarded-For'] = forwardedFor
    }
    if (realIp) {
      headers['X-Real-IP'] = realIp
    }

    const response = await fetch(`${backendUrl}/api/reactions/status`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ postIds, productIds, commentIds })
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json({ error: 'Backend API error' }, { status: response.status })
    }

    const text = await response.text()

    let nextResponse: NextResponse
    try {
      nextResponse = NextResponse.json(JSON.parse(text), { status: response.status })
    } catch {
      nextResponse = new NextResponse(text, { status: response.status })
    }

    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      nextResponse.headers.set('set-cookie', setCookie)
    }

    return nextResponse

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
