import { NextRequest, NextResponse } from 'next/server'

export const BACKEND = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8080'

export function passThroughHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {}
  
  // 중요한 헤더들만 전달
  const importantHeaders = ['authorization', 'content-type', 'user-agent']
  
  importantHeaders.forEach(header => {
    const value = req.headers.get(header)
    if (value) {
      headers[header] = value
    }
  })
  
  return headers
}

export async function proxyRequest(
  req: NextRequest,
  path: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: any
  } = {}
) {
  try {
    const method = options.method || req.method
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...passThroughHeaders(req),
      ...options.headers,
    }

    const body = options.body || await req.text()

    const response = await fetch(`${BACKEND}${path}`, {
      method,
      headers,
      body: method !== 'GET' ? body : undefined,
    })

    const responseText = await response.text()

    // JSON 응답이면 JSON으로, 아니면 텍스트로 반환
    try {
      const jsonData = JSON.parse(responseText)
      return NextResponse.json(jsonData, { status: response.status })
    } catch {
      return new NextResponse(responseText, { status: response.status })
    }
  } catch (error) {
    console.error(`프록시 요청 실패 (${path}):`, error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
