import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {

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
    const authHeader = request.headers.get('authorization') || ''
    
    const body = await request.json()
    
    const backendUrl = `http://localhost:8080/api/partner/admin/products/${params.id}/status`
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json({ 
      error: `서버 오류: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 })
  }
}