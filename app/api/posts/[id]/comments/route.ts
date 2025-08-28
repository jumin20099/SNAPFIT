import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization');
    
    console.log('=== 댓글 목록 조회 프록시 시작 ===');
    console.log('요청 경로:', `/api/posts/${params.id}/comments`);
    console.log('Authorization 헤더:', token);
    console.log('토큰 길이:', token ? token.length : 'null');
    
    if (!token) {
      console.log('토큰이 없음 - 401 반환');
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다' },
        { status: 401 }
      );
    }

    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/posts/${params.id}/comments?${request.nextUrl.searchParams.toString()}`;
    console.log('백엔드 URL:', backendUrl);

    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    console.log('백엔드 응답 상태:', response.status);
    console.log('백엔드 응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.log('백엔드 에러 응답:', errorData);
      return NextResponse.json(
        { error: '댓글 목록 조회 실패', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('백엔드 응답 데이터:', data);
    console.log('=== 댓글 목록 조회 프록시 완료 ===');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('댓글 목록 조회 프록시 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/posts/${params.id}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: '댓글 작성 실패', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('댓글 작성 프록시 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
