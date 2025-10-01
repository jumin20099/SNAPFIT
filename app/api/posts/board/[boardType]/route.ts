import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { boardType: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '20'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortDir = searchParams.get('sortDir') || 'desc'

    // 프론트엔드 복수형을 백엔드 단수형으로 변환
    const boardTypeMapping: Record<string, string> = {
      outfits: 'OUTFIT',
      questions: 'QUESTION',
      info: 'INFO',
    }

    const backendBoardType = boardTypeMapping[params.boardType] ?? params.boardType?.toUpperCase()

    if (!backendBoardType || !['OUTFIT', 'QUESTION', 'INFO'].includes(backendBoardType)) {
      return NextResponse.json(
        { error: 'Invalid board type' },
        { status: 400 }
      )
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts/board/${backendBoardType}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Board posts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board posts' },
      { status: 500 }
    )
  }
}
