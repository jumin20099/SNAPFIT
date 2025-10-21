import { NextRequest, NextResponse } from 'next/server'
import { fetchBackendWithAuth } from '@/api/_utils/backend-fetch'

export async function GET(request: NextRequest) {
  try {
    const { response, refreshedCookie } = await fetchBackendWithAuth(request, {
      path: '/api/admin/stores/list',
      init: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    })
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
      }
      throw new Error(`백엔드 API 오류: ${response.status}`)
    }

    const data = await response.json()
    const nextResponse = NextResponse.json(data)
    if (refreshedCookie) {
      nextResponse.headers.append('set-cookie', refreshedCookie)
    }
    return nextResponse
  } catch (error) {
    console.error('어드민 제휴몰 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '제휴몰 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
