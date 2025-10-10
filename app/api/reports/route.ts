import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    const scope = request.nextUrl.searchParams.get('scope')

    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const path = scope === 'my' ? '/api/reports/my' : '/api/reports'
    const backendUrl = new URL(`${BACKEND_URL}${path}`)
    request.nextUrl.searchParams.forEach((value, key) => {
      if (key !== 'scope') {
        backendUrl.searchParams.append(key, value)
      }
    })

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      return NextResponse.json(
        { error: '신고 목록을 가져올 수 없습니다' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const normalizedBody = {
      ...body,
      targetType: body.targetType ? String(body.targetType).toUpperCase() : body.targetType,
      category: body.category ? String(body.category).toUpperCase() : body.category,
    }

    const response = await fetch(`${BACKEND_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      return NextResponse.json(
        { error: '신고를 생성할 수 없습니다' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Reports POST API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
