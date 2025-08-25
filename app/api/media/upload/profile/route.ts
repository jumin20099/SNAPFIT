import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = request.headers.get('authorization');

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/media/upload/profile`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': token || '',
      },
      body: formData,
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('프로필 이미지 업로드 프록시 에러:', error);
    return NextResponse.json(
      { success: false, error: '이미지 업로드 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
