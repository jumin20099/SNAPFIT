import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    // 쿼리 파라미터에서 토큰 확인
    const queryToken = request.nextUrl.searchParams.get('token')
    
    const authToken = token || queryToken
    
    // 토큰이 없으면 401 오류 반환
    if (!authToken) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다' }, { status: 401 })
    }

    // 백엔드 SSE 엔드포인트로 연결
    const backendUrl = `${BACKEND_URL}/api/notifications/stream`
    
    // SSE 응답 헤더 설정
    const response = new NextResponse(
      new ReadableStream({
        start(controller) {
          // 백엔드와 연결
          const backendResponse = fetch(backendUrl, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Accept': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            }
          })

          backendResponse.then(async (res) => {
            if (!res.ok) {
              controller.error(new Error(`백엔드 연결 실패: ${res.status}`))
              return
            }

            const reader = res.body?.getReader()
            if (!reader) {
              controller.error(new Error('백엔드 응답 스트림을 읽을 수 없습니다'))
              return
            }

            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                
                // 백엔드에서 받은 데이터를 클라이언트로 전달
                controller.enqueue(value)
              }
            } catch (error) {
              console.error('SSE 스트림 읽기 오류:', error)
              controller.error(error)
            } finally {
              reader.releaseLock()
              controller.close()
            }
          }).catch(error => {
            console.error('백엔드 연결 오류:', error)
            controller.error(error)
          })
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        }
      }
    )

    return response

  } catch (error) {
    console.error('SSE 스트림 연결 오류:', error)
    return NextResponse.json(
      { error: 'SSE 연결에 실패했습니다' }, 
      { status: 500 }
    )
  }
}
