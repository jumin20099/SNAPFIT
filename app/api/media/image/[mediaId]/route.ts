import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { mediaId: string } }
) {
  try {
    const { mediaId } = params;
    
    // 백엔드에서 이미지 가져오기
    const response = await fetch(`http://localhost:8080/api/media/image/${mediaId}`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // 이미지 데이터와 Content-Type 가져오기
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // 응답 반환
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
      },
    });
  } catch (error) {
    console.error('이미지 프록시 에러:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
