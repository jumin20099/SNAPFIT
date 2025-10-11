import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = params

    // 백엔드 API 호출 시도
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/products/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.warn(`백엔드 API 응답 오류: ${response.status}, mock 응답 사용`)
      }
    } catch (backendError) {
      console.warn('백엔드 API 호출 실패, mock 응답 사용:', backendError)
    }

    // 백엔드 API가 없을 때 에러 반환
    return NextResponse.json(
      { error: '상품을 찾을 수 없습니다.' },
      { status: 404 }
    )
  } catch (error) {
    console.error('어드민 상품 조회 오류:', error)
    return NextResponse.json(
      { error: '상품 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // 백엔드 API 호출 시도
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.warn(`백엔드 API 응답 오류: ${response.status}, mock 응답 사용`)
      }
    } catch (backendError) {
      console.warn('백엔드 API 호출 실패, mock 응답 사용:', backendError)
    }

    // 백엔드 API가 없을 때 에러 반환
    return NextResponse.json(
      { error: '상품 수정에 실패했습니다.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('어드민 상품 수정 오류:', error)
    return NextResponse.json(
      { error: '상품 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}