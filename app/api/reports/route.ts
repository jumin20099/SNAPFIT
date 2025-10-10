import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

// CSRF 토큰 검증 함수
async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  const csrfToken = request.headers.get('X-CSRF-TOKEN')
  if (!csrfToken) {
    return false
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/csrf/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
      credentials: 'include',
    })
    
    if (!response.ok) {
      return false
    }
    
    const result = await response.json()
    return result.valid === true
  } catch (error) {
    console.error('CSRF 토큰 검증 실패:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const scope = request.nextUrl.searchParams.get('scope')

    const path = scope === 'my' ? '/api/reports/my' : '/api/reports'
    const backendUrl = new URL(`${BACKEND_URL}${path}`)
    request.nextUrl.searchParams.forEach((value, key) => {
      if (key !== 'scope') {
        backendUrl.searchParams.append(key, value)
      }
    })

    // 쿠키를 백엔드로 전달
    const cookies = request.headers.get('cookie')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (cookies) {
      headers['Cookie'] = cookies
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      return NextResponse.json(
        { error: '신고 목록을 가져올 수 없습니다' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const normalizedBody = {
      ...body,
      targetType: body.targetType ? String(body.targetType).toUpperCase() : body.targetType,
      category: body.category ? String(body.category).toUpperCase() : body.category,
    }

    // 쿠키를 백엔드로 전달
    const cookies = request.headers.get('cookie')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (cookies) {
      headers['Cookie'] = cookies
    }

    const response = await fetch(`${BACKEND_URL}/api/reports`, {
      method: 'POST',
      headers,
      body: JSON.stringify(normalizedBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      return NextResponse.json(
        { error: '신고를 생성할 수 없습니다' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Reports POST API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
