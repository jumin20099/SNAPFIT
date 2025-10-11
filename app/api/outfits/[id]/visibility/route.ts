import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
    const outfitIdx = params.id
    const body = await request.json()
    const token = request.headers.get('authorization')
    
    console.log('Next.js API - Toggle visibility for outfit:', outfitIdx)
    console.log('Next.js API - Request body:', JSON.stringify(body, null, 2))
    console.log('Next.js API - Token:', token)
    
    const response = await fetch(`${BACKEND_URL}/api/outfits/${outfitIdx}/visibility`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify(body),
    })

    console.log('Backend visibility response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend visibility error response:', errorText)
      throw new Error(`Backend error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Outfit visibility toggle error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle outfit visibility' },
      { status: 500 }
    )
  }
}
