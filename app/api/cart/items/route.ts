import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 사용자 ID 추출 (실제 구현에서는 JWT 토큰에서 추출)
    const userId = request.cookies.get('userId')?.value || '1' // 임시로 1 사용
    
    console.log('장바구니 조회 요청 - userId:', userId)
    
    const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
      method: 'GET',
      headers: {
        'X-User-Id': userId,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      return NextResponse.json({ error: '장바구니 조회 실패' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('장바구니 조회 API 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
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
    const userId = request.cookies.get('userId')?.value || '1' // 임시로 1 사용
    
    const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: '장바구니 추가 실패' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('장바구니 추가 API 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
    const userId = request.cookies.get('userId')?.value || '1' // 임시로 1 사용
    
    const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
      method: 'DELETE',
      headers: {
        'X-User-Id': userId,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      return NextResponse.json({ error: '장바구니 비우기 실패' }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('장바구니 비우기 API 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
