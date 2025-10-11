/**
 * CSRF 토큰 관리 및 검증 유틸리티
 */

let csrfToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

/**
 * CSRF 토큰 가져오기
 */
export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = fetchCsrfToken();
  csrfToken = await tokenPromise;
  return csrfToken;
}

/**
 * CSRF 토큰 새로고침
 */
export async function refreshCsrfToken(): Promise<string> {
  csrfToken = null;
  tokenPromise = null;
  return getCsrfToken();
}

/**
 * 서버에서 CSRF 토큰 가져오기
 */
async function fetchCsrfToken(): Promise<string> {
  try {
    console.log('CSRF 토큰 요청 시작: /api/csrf/token');
    const response = await fetch('/api/csrf/token', {
      method: 'GET',
      credentials: 'include',
    });

    console.log('CSRF 토큰 응답 상태:', response.status, response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CSRF 토큰 응답 오류:', errorText);
      throw new Error(`CSRF 토큰 가져오기 실패: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('CSRF 토큰 응답 데이터:', data);
    return data.token;
  } catch (error) {
    console.error('CSRF 토큰 가져오기 오류:', error);
    throw error;
  }
}

/**
 * API 요청에 CSRF 토큰 추가
 */
export async function addCsrfTokenToHeaders(headers: HeadersInit = {}): Promise<HeadersInit> {
  try {
    const token = await getCsrfToken();
    return {
      ...headers,
      'X-CSRF-TOKEN': token,
    };
  } catch (error) {
    console.error('CSRF 토큰 추가 실패:', error);
    return headers;
  }
}

/**
 * Next.js API 라우트에서 CSRF 토큰 검증
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const csrfToken = request.headers.get('X-CSRF-TOKEN');
  if (!csrfToken) {
    return false;
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/csrf/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
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
