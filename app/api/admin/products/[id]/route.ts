import { NextRequest, NextResponse } from 'next/server'
import { extractCsrfHeader } from '@/api/_utils/auth'
import { fetchBackendWithAuth } from '@/api/_utils/backend-fetch'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { response, refreshedCookie } = await fetchBackendWithAuth(request, {
      path: `/api/admin/products/${id}`,
      init: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    })

    if (response.status === 401) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    if (!response.ok) {
      console.warn(`백엔드 API 응답 오류: ${response.status}, mock 응답 사용`)
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const data = await response.json()
    const nextResponse = NextResponse.json(data)
    if (refreshedCookie) {
      nextResponse.headers.append('set-cookie', refreshedCookie)
    }
    return nextResponse
  } catch (error) {
    console.error('어드민 상품 조회 오류:', error)
    return NextResponse.json(
      { error: '상품 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const csrfHeader = extractCsrfHeader(request)

    const { response, refreshedCookie } = await fetchBackendWithAuth(request, {
      path: `/api/admin/products/${id}`,
      init: {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfHeader ? { 'X-CSRF-TOKEN': csrfHeader } : {}),
        },
        body: JSON.stringify(body),
      },
    })

    if (response.status === 401) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    if (!response.ok) {
      console.warn(`백엔드 API 응답 오류: ${response.status}, mock 응답 사용`)
      return NextResponse.json(
        { error: '상품 수정에 실패했습니다.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const nextResponse = NextResponse.json(data)
    if (refreshedCookie) {
      nextResponse.headers.append('set-cookie', refreshedCookie)
    }
    return nextResponse
  } catch (error) {
    console.error('어드민 상품 수정 오류:', error)
    return NextResponse.json(
      { error: '상품 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}
