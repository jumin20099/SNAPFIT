import { NextRequest, NextResponse } from 'next/server'

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

    const authorization = request.headers.get('authorization')

    // 백엔드가 @RequestParam을 기대하므로 x-www-form-urlencoded로 전달
    const body = new URLSearchParams({
      targetIdx: targetIdx.toString(),
      targetType: targetType.toUpperCase(),
    })

    const response = await fetch('http://localhost:8080/api/likes/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(authorization && { Authorization: authorization }),
      },
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