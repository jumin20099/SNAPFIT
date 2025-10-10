/**
 * CSRF 토큰 관리 유틸리티
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
    const response = await fetch('/api/csrf/token', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('CSRF 토큰 가져오기 실패');
    }

    const data = await response.json();
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
