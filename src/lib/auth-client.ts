/**
 * 클라이언트 사이드 인증 유틸리티
 * HttpOnly 쿠키 기반 인증을 사용합니다.
 */

/**
 * 인증이 필요한 fetch 요청을 수행합니다.
 * HttpOnly 쿠키를 자동으로 전송합니다.
 * 
 * @param url - 요청 URL
 * @param options - fetch 옵션
 * @returns fetch Response
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'include', // HttpOnly 쿠키 자동 전송
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * 사용자가 로그인되어 있는지 확인합니다.
 * HttpOnly 쿠키는 클라이언트에서 접근할 수 없으므로,
 * 서버에 요청을 보내서 확인합니다.
 * 
 * @returns 로그인 여부
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await authenticatedFetch('/api/user/info');
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 현재 사용자 정보를 가져옵니다.
 * 
 * @returns 사용자 정보 또는 null
 */
export async function getCurrentUser(): Promise<any | null> {
  try {
    const response = await authenticatedFetch('/api/user/info');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 로그아웃을 수행합니다.
 * 서버에 로그아웃 요청을 보내 쿠키를 삭제합니다.
 */
export async function logout(): Promise<void> {
  try {
    await authenticatedFetch('/api/auth/logout', {
      method: 'POST',
    });
    // 로그아웃 후 홈으로 리다이렉트
    window.location.href = '/';
  } catch (error) {
    console.error('로그아웃 실패:', error);
  }
}

