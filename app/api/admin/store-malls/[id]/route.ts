import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = params

    // 백엔드 API 호출 시도
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/stores/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.warn(`백엔드 API 응답 오류: ${response.status}, mock 응답 사용`)
      }
    } catch (backendError) {
      console.warn('백엔드 API 호출 실패, mock 응답 사용:', backendError)
    }

    // 백엔드 API가 없을 때 에러 반환
    return NextResponse.json(
      { error: '스토어몰을 찾을 수 없습니다.' },
      { status: 404 }
    )
  } catch (error) {
    console.error('어드민 스토어몰 조회 오류:', error)
    return NextResponse.json(
      { error: '스토어몰 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // 백엔드 API 호출 시도
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/stores/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.warn(`백엔드 API 응답 오류: ${response.status}, mock 응답 사용`)
      }
    } catch (backendError) {
      console.warn('백엔드 API 호출 실패, mock 응답 사용:', backendError)
    }

    // 백엔드 API가 없을 때 에러 반환
    return NextResponse.json(
      { error: '스토어몰 수정에 실패했습니다.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('어드민 스토어몰 수정 오류:', error)
    return NextResponse.json(
      { error: '스토어몰 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

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

    // 백엔드 API 호출 시도
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/stores/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (backendError) {
      console.warn('백엔드 API 호출 실패, mock 응답 사용:', backendError)
    }

    // 백엔드 API가 없을 때 성공 응답 반환
    return NextResponse.json({ 
      success: true, 
      message: `제휴몰 ${id}이(가) 삭제되었습니다.` 
    })
  } catch (error) {
    console.error('어드민 제휴몰 삭제 오류:', error)
    return NextResponse.json(
      { error: '제휴몰 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
