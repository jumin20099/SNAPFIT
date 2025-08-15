import { NextRequest, NextResponse } from 'next/server'
const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

export async function PUT(request: NextRequest) {
  try {
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