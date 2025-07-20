import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 프론트에서 받은 Authorization 헤더를 백엔드로 전달
    const authHeader = request.headers.get('authorization') || '';
    const response = await fetch('http://localhost:8080/api/user/info', {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return NextResponse.json(userData);
    } else {
      return NextResponse.json({ role: 'USER' }, { status: 200 });
    }
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    return NextResponse.json({ role: 'USER' }, { status: 200 });
  }
} 