import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

export async function POST(request: NextRequest) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
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
    
    // 보안: 민감한 정보 로깅 제거
    // console.log('Next.js API 라우트 - 요청 헤더:', {...})
    
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

    console.log('백엔드 API 응답:', {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json({ error: 'Backend API error' }, { status: response.status })
    }

    const text = await response.text()
    console.log('백엔드 응답 데이터:', text)

    let nextResponse: NextResponse
    try {
      const parsedData = JSON.parse(text)
      console.log('파싱된 응답 데이터:', parsedData)
      nextResponse = NextResponse.json(parsedData, { status: response.status })
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
