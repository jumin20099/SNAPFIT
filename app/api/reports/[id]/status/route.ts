import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

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

    
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const normalizedBody = {
      ...body,
      status: body.status ? String(body.status).toUpperCase() : body.status,
    }
    const reportId = params.id

    // 백엔드로 상태 변경 요청 전달
    const response = await fetch(`${BACKEND_URL}/api/reports/${reportId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      return NextResponse.json(
        { error: '신고 상태를 변경할 수 없습니다' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Report status update API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
