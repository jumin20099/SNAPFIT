// app/api/admin/partner/applications/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = request.headers.get('authorization') || ''
  const body = await request.text()
  const res = await fetch(`${API_BASE}/api/partner/admin/applications/${params.id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) },
    body,
  })
  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : await res.text()
  return NextResponse.json(data, { status: res.status })
}

// GET은 백엔드에 /status 조회가 없음. 더미 금지 → 405로 명확하게
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}