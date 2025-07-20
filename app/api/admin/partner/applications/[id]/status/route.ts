import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const body = await request.json()
    
    console.log('Admin Partner Application Status API called')
    console.log('Params:', params)
    console.log('Body:', body)
    console.log('Backend URL:', `${backendUrl}/api/partner/admin/applications/${params.id}/status`)
    
    const response = await fetch(`${backendUrl}/api/partner/admin/applications/${params.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('Backend response status:', response.status)
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Backend response data:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin Partner Application Status API error:', error)
    return NextResponse.json(
      { error: 'Failed to update partner application status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 