import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    
    const response = await fetch(`${API_BASE}/api/partner/application`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization })
      },
    })

    if (response.status === 404) {
      return NextResponse.json(null)
    }

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength === '0') {
      return NextResponse.json(null)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Application API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const body = await req.text()

  const response = await fetch(`${API_BASE}/api/partner/application`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body,
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}