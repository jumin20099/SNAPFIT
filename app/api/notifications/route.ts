import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다' }, { status: 401 })
    }

    // 백엔드 API 호출
    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`백엔드 API 오류: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('알림 조회 오류:', error)
    return NextResponse.json(
      { error: '알림을 가져오는데 실패했습니다' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`백엔드 API 오류: ${response.status}`)
    }

    return NextResponse.json({ message: '모든 알림이 삭제되었습니다' })
  } catch (error) {
    console.error('알림 삭제 오류:', error)
    return NextResponse.json(
      { error: '알림 삭제에 실패했습니다' }, 
      { status: 500 }
    )
  }
}
