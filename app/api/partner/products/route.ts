import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const query = request.nextUrl.search || ''
    const authHeader = request.headers.get('authorization') || undefined

    const response = await fetch(`${backendUrl}/api/partner/products${query}`, {
      method: 'GET',
      headers: authHeader ? { Authorization: authHeader } : undefined,
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products data' },
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

    const body = await request.text() // 그대로 전달
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const authHeader = request.headers.get('authorization') || undefined

    const response = await fetch(`${backendUrl}/api/partner/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Failed to submit product' }, { status: 500 })
  }
} 