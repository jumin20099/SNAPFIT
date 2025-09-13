import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function PUT(
  request: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  try {
    const body = await request.json()
    const userId = request.cookies.get('userId')?.value || '1' // 임시로 1 사용
    const { cartItemId } = params
    
    const response = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}?quantity=${body.quantity}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      return NextResponse.json({ error: '장바구니 수량 수정 실패' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('장바구니 수량 수정 API 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  try {
    const userId = request.cookies.get('userId')?.value || '1' // 임시로 1 사용
    const { cartItemId } = params
    
    const response = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}`, {
      method: 'DELETE',
      headers: {
        'X-User-Id': userId,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      return NextResponse.json({ error: '장바구니 아이템 삭제 실패' }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('장바구니 아이템 삭제 API 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
