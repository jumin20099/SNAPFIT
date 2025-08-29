import { NextRequest, NextResponse } from 'next/server'

const BE = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8080'

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? ''
    
    const res = await fetch(`${BE}/api/likes/my/posts`, {
      headers: { 
        ...(auth && { 'Authorization': auth }) 
      },
      cache: 'no-store',
    })
    
    const text = await res.text()
    try { 
      return NextResponse.json(JSON.parse(text), { status: res.status }) 
    } catch { 
      return new NextResponse(text, { status: res.status })
    }
  } catch (error) {
    console.error('좋아요한 게시글 목록 조회 프록시 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
