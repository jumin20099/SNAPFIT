import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`백엔드 API 오류: ${response.status}`)
    }

    return NextResponse.json({ message: '모든 알림이 읽음 처리되었습니다' })
  } catch (error) {
    console.error('모든 알림 읽음 처리 오류:', error)
    return NextResponse.json(
      { error: '모든 알림 읽음 처리에 실패했습니다' }, 
      { status: 500 }
    )
  }
}
