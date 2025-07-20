import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Admin Partner Applications API called ===')
    console.log('Timestamp:', new Date().toISOString())
    
    const response = await fetch('http://localhost:8080/api/partner/admin/applications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    })

    console.log('Backend response status:', response.status)
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Backend response data:', data)
    
    // 캐시 방지 헤더 추가
    const nextResponse = NextResponse.json(data)
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    nextResponse.headers.set('Pragma', 'no-cache')
    nextResponse.headers.set('Expires', '0')
    
    return nextResponse
  } catch (error) {
    console.error('Admin Partner Applications API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner applications' },
      { status: 500 }
    )
  }
} 