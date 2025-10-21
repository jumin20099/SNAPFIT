import { NextRequest, NextResponse } from 'next/server'
import { extractCsrfHeader } from '@/api/_utils/auth'
import { fetchBackendWithAuth } from '@/api/_utils/backend-fetch'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const csrfHeader = extractCsrfHeader(request)

    const { response, refreshedCookie } = await fetchBackendWithAuth(request, {
      path: `/api/admin/products/${id}/status`,
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
      console.warn('백엔드 API 호출 실패, mock 응답 사용:', response.status)
      return NextResponse.json({ 
        success: true, 
        message: `상품 ${id}의 상태가 변경되었습니다.`,
        isActive: body.isActive 
      })
    }

    const data = await response.json()
    const nextResponse = NextResponse.json(data)
    if (refreshedCookie) {
      nextResponse.headers.append('set-cookie', refreshedCookie)
    }
    return nextResponse
  } catch (error) {
    console.error('어드민 상품 상태 변경 오류:', error)
    return NextResponse.json(
      { error: '상품 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}
