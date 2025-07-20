import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Admin Partner Application Status API called ===')
    console.log('Params:', params)
    
    const body = await request.json()
    console.log('Body:', body)
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const url = `${backendUrl}/api/partner/admin/applications/${params.id}/status`
    console.log('Backend URL:', url)
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      return NextResponse.json(
        { error: `Backend error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Backend response data:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('=== Admin Partner Application Status API error ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'No message')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('Full error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update partner application status', 
        details: error instanceof Error ? error.message : String(error),
        type: typeof error
      },
      { status: 500 }
    )
  }
} 