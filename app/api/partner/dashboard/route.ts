import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

    // 쿼리스트링 그대로 전달
    const query = request.nextUrl.search || ''

    // Authorization 헤더 전달 (없으면 undefined)
    const authHeader = request.headers.get('authorization') || undefined

    const response = await fetch(`${backendUrl}/api/partner/dashboard${query}`, {
      method: 'GET',
      headers: authHeader ? { Authorization: authHeader } : undefined,
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
} 