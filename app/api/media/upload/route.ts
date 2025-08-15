import { NextRequest } from 'next/server'

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const formData = await req.formData()

  const backendRes = await fetch(`${API_BASE}/api/media/upload`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
    },
    body: formData as any,
  })

  const contentType = backendRes.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await backendRes.json()
    : await backendRes.text()

  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    { status: backendRes.status, headers: { 'content-type': contentType } }
  )
}