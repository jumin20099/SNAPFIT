import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // 이미지 URL이 S3 버킷인지 확인
    if (!imageUrl.includes('snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com')) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    // 이미지 가져오기
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    
    // CORS 헤더 추가
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=31536000', // 1년 캐시
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
