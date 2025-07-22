import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== GET API Route Test ===')
  console.log('Product ID:', params.id)
  return NextResponse.json({ 
    message: 'API Route is working', 
    productId: params.id,
    timestamp: new Date().toISOString()
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== API Route Debug Start ===')
    console.log('Product ID:', params.id)
    
    const authHeader = request.headers.get('authorization') || ''
    console.log('Auth header:', authHeader ? 'Present' : 'Missing')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const backendUrl = `http://localhost:8080/api/partner/admin/products/${params.id}/status`
    console.log('Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    })

    console.log('Backend response status:', response.status)
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.json()
      console.log('Backend response data:', data)
      console.log('=== API Route Success ===')
      return NextResponse.json(data)
    } else {
      const errorText = await response.text()
      console.log('Backend error response:', errorText)
      console.log('=== API Route Backend Error ===')
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
  } catch (error) {
    console.error('=== API Route Exception ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('=== API Route Debug End ===')
    return NextResponse.json({ 
      error: `서버 오류: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 })
  }
}