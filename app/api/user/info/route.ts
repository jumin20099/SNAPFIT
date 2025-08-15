import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || ''
  try {
    const response = await fetch(`${API_BASE}/api/user/info`, {
      headers: {
        Authorization: authHeader,
      },
    })

    // 백엔드의 응답을 그대로 반환
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('Failed to get user info:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}