import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const body = await request.json()
    
    const response = await fetch(`${backendUrl}/api/partner/admin/applications/${params.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin Partner Application Status API error:', error)
    return NextResponse.json(
      { error: 'Failed to update partner application status' },
      { status: 500 }
    )
  }
} 