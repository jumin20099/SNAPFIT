/**
 * Next.js API 라우트에서 CSRF 토큰 검증
 */

import { NextRequest } from 'next/server';

/**
 * CSRF 토큰 검증
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  try {
    const csrfToken = request.headers.get('X-CSRF-TOKEN');
    
    if (!csrfToken) {
      return false;
    }

    // 백엔드에서 CSRF 토큰 검증
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/csrf/validate`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': csrfToken,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.error('CSRF 토큰 검증 실패:', error);
    return false;
  }
}

/**
 * CSRF 토큰이 필요한 메서드인지 확인
 */
export function requiresCsrfToken(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
}

/**
 * CSRF 검증이 필요한 요청인지 확인
 */
export function shouldValidateCsrf(request: NextRequest): boolean {
  return requiresCsrfToken(request.method);
}
