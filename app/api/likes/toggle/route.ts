import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let targetIdx: string | null = null
    let targetType: string | null = null

    if (contentType.includes('application/json')) {
      const json = await request.json()
      targetIdx = json.productId?.toString() ?? json.targetIdx?.toString() ?? json.id?.toString() ?? null
      targetType = (json.targetType ?? 'PRODUCT')?.toString()
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData()
      targetIdx = (formData.get('targetIdx') || formData.get('productId') || formData.get('id')) as string | null
      targetType = ((formData.get('targetType') as string) || 'PRODUCT') as string
    } else {
      // 지원하지 않는 타입일 경우 JSON으로 한 번 더 시도
      try {
        const json = await request.json()
        targetIdx = json.productId?.toString() ?? json.targetIdx?.toString() ?? json.id?.toString() ?? null
        targetType = (json.targetType ?? 'PRODUCT')?.toString()
      } catch {
        return NextResponse.json({ error: '지원하지 않는 Content-Type' }, { status: 400 })
      }
    }

    if (!targetIdx) {
      return NextResponse.json({ error: 'targetIdx가 없습니다.' }, { status: 400 })
    }
    if (!targetType) {
      targetType = 'PRODUCT'
    }

    // 쿠키에서 토큰 읽기 (SSR에서 사용)
    const cookieStore = cookies()
    const cookieToken = cookieStore.get('auth_token')?.value
    
    // 헤더에서 토큰 읽기 (클라이언트에서 사용)
    const headerToken = request.headers.get('authorization') || request.headers.get('Authorization') || ''
    
    // 쿠키 토큰이 있으면 사용, 없으면 헤더 토큰 사용
    const authToken = cookieToken || headerToken.replace('Bearer ', '')

    // 백엔드가 @RequestParam을 기대하므로 x-www-form-urlencoded로 전달
    const body = new URLSearchParams({
      targetIdx: targetIdx.toString(),
      targetType: targetType.toUpperCase(),
    })

    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
    const response = await fetch(`${API_BASE_URL}/api/likes/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      credentials: 'include', // 쿠키 전달을 위해 필요
      body: body.toString(),
    })

    if (!response.ok) {
      return NextResponse.json({ error: '좋아요 토글에 실패했습니다.' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
} 