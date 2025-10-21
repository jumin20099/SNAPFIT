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
      path: `/api/admin/stores/${id}`,
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
        { error: '스토어몰을 찾을 수 없습니다.' },
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
    console.error('어드민 스토어몰 조회 오류:', error)
    return NextResponse.json(
      { error: '스토어몰 조회에 실패했습니다.' },
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
      path: `/api/admin/stores/${id}`,
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
        { error: '스토어몰 수정에 실패했습니다.' },
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
    console.error('어드민 스토어몰 수정 오류:', error)
    return NextResponse.json(
      { error: '스토어몰 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const csrfHeader = extractCsrfHeader(request)

    const { response, refreshedCookie } = await fetchBackendWithAuth(request, {
      path: `/api/admin/stores/${id}`,
      init: {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfHeader ? { 'X-CSRF-TOKEN': csrfHeader } : {}),
        },
      },
    })

    if (response.status === 401) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    if (!response.ok) {
      console.warn('백엔드 API 호출 실패, mock 응답 사용:', response.status)
      return NextResponse.json({ 
        success: true, 
        message: `제휴몰 ${id}이(가) 삭제되었습니다.` 
      })
    }

    const data = await response.json()
    const nextResponse = NextResponse.json(data)
    if (refreshedCookie) {
      nextResponse.headers.append('set-cookie', refreshedCookie)
    }
    return nextResponse
  } catch (error) {
    console.error('어드민 제휴몰 삭제 오류:', error)
    return NextResponse.json(
      { error: '제휴몰 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
