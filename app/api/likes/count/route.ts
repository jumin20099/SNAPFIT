import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetIdx = searchParams.get('targetIdx')
    const targetType = searchParams.get('targetType')

    if (!targetIdx || !targetType) {
      return NextResponse.json({ error: 'targetIdx와 targetType이 필요합니다.' }, { status: 400 })
    }

    const backendUrl = `${API_BASE_URL}/api/likes/count?targetIdx=${encodeURIComponent(targetIdx)}&targetType=${encodeURIComponent(targetType)}`
    const response = await fetch(backendUrl, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`좋아요 수 조회 실패: ${response.status} ${text}`)
    }

    const text = await response.text()
    try {
      const json = JSON.parse(text)
      return NextResponse.json(json)
    } catch {
      const numeric = Number(text)
      if (Number.isNaN(numeric)) {
        return NextResponse.json({ error: '응답을 파싱할 수 없습니다.' }, { status: 500 })
      }
      return NextResponse.json(numeric)
    }
  } catch (error) {
    console.error('좋아요 수 프록시 오류:', error)
    return NextResponse.json({ error: '좋아요 수를 불러오지 못했습니다.' }, { status: 500 })
  }
}
