import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = params

    // 백엔드 API 호출
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`백엔드 API 오류: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('어드민 상품 삭제 오류:', error)
    return NextResponse.json(
      { error: '상품 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
