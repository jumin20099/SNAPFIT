import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET() {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()
  const auth = request.headers.get('authorization')

  const res = await fetch(`${API_BASE}/api/admin/products/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(auth && { Authorization: auth }),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
