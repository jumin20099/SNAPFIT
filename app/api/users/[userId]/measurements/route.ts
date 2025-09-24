import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

type RouteParams = {
  params: {
    userId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { userId } = params
  const authHeader = request.headers.get('authorization') ?? ''

  try {
    const response = await fetch(`${API_BASE}/api/users/${userId}/measurements`, {
      method: 'GET',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      credentials: 'include',
    })

    if (response.status === 404) {
      return NextResponse.json(null, { status: 200 })
    }

    const text = await response.text()
    const data = text ? JSON.parse(text) : null
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to fetch user measurements:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { userId } = params
  const authHeader = request.headers.get('authorization') ?? ''

  try {
    const body = await request.text()

    const response = await fetch(`${API_BASE}/api/users/${userId}/measurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
      credentials: 'include',
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to save user measurements:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { userId } = params
  const authHeader = request.headers.get('authorization') ?? ''

  try {
    const response = await fetch(`${API_BASE}/api/users/${userId}/measurements`, {
      method: 'DELETE',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      credentials: 'include',
    })

    return NextResponse.json(null, { status: response.status })
  } catch (error) {
    console.error('Failed to delete user measurements:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
