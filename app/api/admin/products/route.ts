import { NextRequest, NextResponse } from 'next/server'
import { extractCsrfHeader } from '@/api/_utils/auth'
import { fetchBackendWithAuth } from '@/api/_utils/backend-fetch'

export async function GET(request: NextRequest) {
  try {
    const { response, refreshedCookie } = await fetchBackendWithAuth(request, {
      path: '/api/admin/products/list',
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
    console.error('어드민 상품 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '상품 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const csrfHeader = extractCsrfHeader(request)

    const { response, refreshedCookie } = await fetchBackendWithAuth(request, {
      path: '/api/admin/products/add',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfHeader ? { 'X-CSRF-TOKEN': csrfHeader } : {}),
        },
        body: JSON.stringify(body),
      },
    })

    if (response.ok) {
      const data = await response.json()
      const nextResponse = NextResponse.json(data)
      if (refreshedCookie) {
        nextResponse.headers.append('set-cookie', refreshedCookie)
      }
      return nextResponse
    } else {
      if (response.status === 401) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
      }
      console.warn(`백엔드 API 응답 오류: ${response.status}`)
      return NextResponse.json(
        { error: '상품 추가에 실패했습니다.' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('어드민 상품 추가 오류:', error)
    return NextResponse.json(
      { error: '상품 추가에 실패했습니다.' },
      { status: 500 }
    )
  }
}
