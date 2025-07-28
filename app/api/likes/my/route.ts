import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 백엔드 API 호출
    const response = await fetch('http://localhost:8080/api/likes/my', {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      }
    })

    if (!response.ok) {
      console.error('백엔드 좋아요 목록 가져오기 실패:', response.status, response.statusText)
      return NextResponse.json({ error: '좋아요 목록을 가져오는데 실패했습니다.' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('좋아요 목록 가져오기 에러:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
} 