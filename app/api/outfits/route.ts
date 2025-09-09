import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = request.headers.get('authorization')
    
    console.log('Next.js API - Received token:', token)
    console.log('Next.js API - Request body:', JSON.stringify(body, null, 2))
    
    const response = await fetch(`${BACKEND_URL}/api/outfits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify(body),
    })

    console.log('Backend response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      throw new Error(`Backend error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Outfit creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create outfit' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const token = request.headers.get('authorization')
    
    console.log('Next.js API GET - Type:', type, 'Token:', token)
    
    let url = `${BACKEND_URL}/api/outfits`
    if (type === 'my') {
      url += '/my'
    } else if (type === 'public') {
      url += '/public'
    }
    
    console.log('Next.js API GET - Backend URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token || '',
      },
    })

    console.log('Backend GET response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend GET error response:', errorText)
      throw new Error(`Backend error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Outfit fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outfits' },
      { status: 500 }
    )
  }
}
