import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken } from '@/lib/csrf-utils';

export async function PATCH(request: NextRequest) {
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
    const token = request.headers.get('authorization');

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/user/profile`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('프로필 업데이트 프록시 에러:', error);
    return NextResponse.json(
      { success: false, error: '프로필 업데이트 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
