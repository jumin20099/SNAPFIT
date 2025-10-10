/**
 * 쿠키 관련 유틸리티 함수들
 * HTTP-only 쿠키는 서버에서만 설정할 수 있으므로, 
 * 클라이언트에서는 일반 쿠키만 관리합니다.
 */

/**
 * 쿠키에서 값을 읽어옵니다
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // SSR 환경에서는 null 반환
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

/**
 * 쿠키에 값을 설정합니다
 * @param name 쿠키 이름
 * @param value 쿠키 값
 * @param days 만료일 (기본값: 7일)
 * @param secure HTTPS에서만 전송 (기본값: true)
 * @param sameSite SameSite 속성 (기본값: 'strict')
 */
export function setCookie(
  name: string, 
  value: string, 
  days: number = 7,
  secure: boolean = true,
  sameSite: 'strict' | 'lax' | 'none' = 'strict'
): void {
  if (typeof document === 'undefined') {
    return; // SSR 환경에서는 무시
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
  
  if (secure && typeof window !== 'undefined' && window.location.protocol === 'https:') {
    cookieString += '; secure';
  }
  
  cookieString += `; samesite=${sameSite}`;
  
  document.cookie = cookieString;
}

/**
 * 쿠키를 삭제합니다
 * @param name 쿠키 이름
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return; // SSR 환경에서는 무시
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * 모든 쿠키를 가져옵니다
 * @returns 쿠키 객체
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') {
    return {}; // SSR 환경에서는 빈 객체 반환
  }

  const cookies: Record<string, string> = {};
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}
