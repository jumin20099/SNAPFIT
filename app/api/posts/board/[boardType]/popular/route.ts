import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { boardType: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '20'

    // 프론트엔드 복수형을 백엔드 단수형으로 변환
    const boardTypeMapping: Record<string, string> = {
      'questions': 'question',
      'info': 'info',
      'outfits': 'outfit'
    }
    const backendBoardType = boardTypeMapping[params.boardType] || params.boardType
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts/board/${backendBoardType}/popular?page=${page}&size=${size}`
    
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
    console.error('Popular board posts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular board posts' },
      { status: 500 }
    )
  }
}
