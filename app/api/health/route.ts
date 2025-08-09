import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
    const res = await fetch(`${API_BASE_URL}/api/products/1`, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ ok: false, reason: `backend-status-${res.status}` }, { status: 503 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, reason: 'unreachable' }, { status: 503 })
  }
}


