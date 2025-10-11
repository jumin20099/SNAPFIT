import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Admin test API working' })
}

export async function PUT(request: NextRequest) {
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
    return NextResponse.json({ 
      message: 'Admin test PUT working', 
      received: body 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Admin test PUT failed' },
      { status: 500 }
    )
  }
} 