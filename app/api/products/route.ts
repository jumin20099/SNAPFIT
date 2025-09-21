import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const major = searchParams.get('major')
    const sub = searchParams.get('sub')

    // 백엔드 API URL 구성
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
    let backendUrl = `${API_BASE_URL}/api/products`
    const params = new URLSearchParams()
    
    if (major) params.append('major', major)
    if (sub) params.append('sub', sub)
    
    if (params.toString()) {
      backendUrl += `?${params.toString()}`
    }



    const auth = request.headers.get('authorization') || ''
    console.log('상품 목록 API - Authorization 헤더:', auth ? '존재함' : '없음')
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(auth && { Authorization: auth }),
      },
    })



    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      throw new Error(`Backend API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
} 