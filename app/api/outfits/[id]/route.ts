import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function DELETE(
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

    
    const token = request.headers.get('authorization')
    
    const response = await fetch(`${BACKEND_URL}/api/outfits/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token || '',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Outfit deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete outfit' },
      { status: 500 }
    )
  }
}
