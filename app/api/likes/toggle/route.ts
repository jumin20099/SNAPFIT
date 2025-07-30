import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const targetIdx = formData.get('targetIdx')
    const targetType = formData.get('targetType')

    if (!targetIdx || !targetType) {
      return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
    }

    // Authorization 헤더 가져오기
    const authorization = request.headers.get('authorization')
  

    // 백엔드 API 호출
  
    const response = await fetch('http://localhost:8080/api/likes/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(authorization && { 'Authorization': authorization })
      },
      body: `targetIdx=${targetIdx}&targetType=${targetType}`
    })

    if (!response.ok) {
      console.error('백엔드 좋아요 토글 실패:', response.status, response.statusText)
      return NextResponse.json({ error: '좋아요 토글에 실패했습니다.' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('좋아요 토글 에러:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
} 