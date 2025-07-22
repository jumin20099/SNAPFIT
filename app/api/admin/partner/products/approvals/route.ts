import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const response = await fetch('http://localhost:8080/api/partner/admin/products/approvals', {
      headers: {
        'Authorization': authHeader,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
  } catch (error) {
    console.error('상품 승인 대기 목록 조회 실패:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}