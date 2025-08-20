import { NextRequest, NextResponse } from 'next/server'

const BE = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8080'

export async function POST(req: NextRequest) {
  try {
    // 디버깅 로그 추가
    console.log('=== 좋아요 토글 API 라우트 시작 ===')
    console.log('요청 헤더:', Object.fromEntries(req.headers.entries()))
    
    // JSON 바디 그대로 전달
    const raw = await req.text()
    console.log('요청 바디:', raw)
    
    // 클라가 준 Authorization/Content-Type 그대로 전달
    const auth = req.headers.get('authorization') ?? ''
    const ct = req.headers.get('content-type') ?? 'application/json'
    
    console.log('백엔드로 전달할 헤더:', { 'Content-Type': ct, 'Authorization': auth })
    console.log('백엔드 URL:', `${BE}/api/likes/toggle`)

    const res = await fetch(`${BE}/api/likes/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': ct,
        ...(auth && { 'Authorization': auth }),
      },
      body: raw,
    })

    const text = await res.text()
    console.log('백엔드 응답 상태:', res.status)
    console.log('백엔드 응답 헤더:', Object.fromEntries(res.headers.entries()))
    console.log('백엔드 응답 바디:', text)
    
    // 백엔드가 JSON이면 JSON으로, 아니면 원문 그대로 반환
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status })
    } catch {
      return new NextResponse(text, { status: res.status })
    }
  } catch (error) {
    console.error('좋아요 토글 프록시 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
} 