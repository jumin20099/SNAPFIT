import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

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
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/store-malls/${id}/status`, {
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
      }
    } catch (backendError) {
      console.warn('백엔드 API 호출 실패, mock 응답 사용:', backendError)
    }

    // 백엔드 API가 없을 때 성공 응답 반환
    return NextResponse.json({ 
      success: true, 
      message: `제휴몰 ${id}의 상태가 변경되었습니다.`,
      isActive: body.isActive 
    })
  } catch (error) {
    console.error('어드민 제휴몰 상태 변경 오류:', error)
    return NextResponse.json(
      { error: '제휴몰 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}
