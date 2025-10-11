import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

const BE = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    console.log('게시글 조회 프록시:', postId)
    
    const response = await fetch(`${BE}/api/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('백엔드 게시글 조회 실패:', response.status, errorText)
      return NextResponse.json({ error: '게시글을 가져오는데 실패했습니다' }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('게시글 조회 프록시 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
    const postId = params.id
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    const response = await fetch(`${BE}/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('백엔드 게시글 수정 실패:', response.status, errorText)
      return NextResponse.json({ error: '게시글을 수정하지 못했습니다.' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('게시글 수정 프록시 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
    const postId = params.id
    const authHeader = request.headers.get('authorization')
    const bodyText = await request.text()

    const headers: Record<string, string> = {
      ...(authHeader ? { Authorization: authHeader } : {}),
    }
    if (bodyText) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`${BE}/api/posts/${postId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
      ...(bodyText ? { body: bodyText } : {}),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('백엔드 게시글 삭제 실패:', response.status, errorText)
      return NextResponse.json({ error: '게시글을 삭제하지 못했습니다.' }, { status: response.status })
    }

    const text = await response.text()
    try {
      const json = JSON.parse(text)
      return NextResponse.json(json)
    } catch {
      return NextResponse.json({ message: '게시글이 삭제되었습니다.' })
    }
  } catch (error) {
    console.error('게시글 삭제 프록시 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
