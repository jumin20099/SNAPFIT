import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'
const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

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

    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.text()
    const auth = request.headers.get('authorization') || ''

    const url = `${API_BASE}/api/partner/admin/applications/${id}/status`
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) },
      body,
    })

    const ct = response.headers.get('content-type') || ''
    const data = ct.includes('application/json') ? await response.json() : await response.text()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}