import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken } from '@/lib/csrf-utils';

export async function POST(request: NextRequest) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    const body = await request.json();

    // 쿠키를 백엔드로 전달
    const cookies = request.headers.get('cookie')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (cookies) {
      headers['Cookie'] = cookies
    }

    const response = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/scraps/toggle`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: '스크랩 토글 실패', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('스크랩 토글 프록시 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
