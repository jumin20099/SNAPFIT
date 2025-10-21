import { NextRequest, NextResponse } from 'next/server'
import { extractCsrfHeader } from '@/api/_utils/auth'
import { fetchBackendWithAuth } from '@/api/_utils/backend-fetch'

export async function GET() {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()
  const csrfHeader = extractCsrfHeader(request)

  const { response, refreshedCookie } = await fetchBackendWithAuth(request, {
    path: `/api/admin/products/${id}/status`,
    init: {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfHeader ? { 'X-CSRF-TOKEN': csrfHeader } : {}),
      },
      body: JSON.stringify(body),
    },
  })

  if (response.status === 401) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const data = await response.json()
  const nextResponse = NextResponse.json(data, { status: response.status })
  if (refreshedCookie) {
    nextResponse.headers.append('set-cookie', refreshedCookie)
  }
  return nextResponse
}
