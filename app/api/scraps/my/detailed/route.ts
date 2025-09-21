import { NextRequest, NextResponse } from 'next/server'

const BE = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8080'

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? ''

    if (!auth) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다' }, { status: 401 })
    }

    const response = await fetch(`${BE}/api/scraps/my/detailed`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('백엔드 스크랩 상세 목록 조회 실패:', response.status, errorText)
      return NextResponse.json({ error: '스크랩 상세 목록을 가져오는데 실패했습니다' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('스크랩 상세 목록 조회 프록시 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
