/**
 * JWT 토큰에서 사용자 정보를 추출하는 유틸리티 함수들
 */

export interface UserInfo {
  sub: string; // 이메일
  role: string; // 역할
  iat: number; // 발급 시간
  exp: number; // 만료 시간
}

/**
 * JWT 토큰을 디코딩하여 사용자 정보를 추출
 */
export function decodeJWTToken(token: string): UserInfo | null {
  try {
    // JWT 토큰은 header.payload.signature 형태
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('잘못된 JWT 토큰 형태');
      return null;
    }

    // payload 부분을 base64 디코딩
    const payload = parts[1];
    const decodedPayload = atob(payload);
    const userInfo = JSON.parse(decodedPayload);

    return userInfo as UserInfo;
  } catch (error) {
    console.error('JWT 토큰 디코딩 실패:', error);
    return null;
  }
}

/**
 * localStorage에서 JWT 토큰을 가져옴
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('JWT 토큰 가져오기 실패:', error);
    return null;
  }
}

/**
 * localStorage에서 현재 사용자 정보를 가져옴
 */
export function getCurrentUser(): UserInfo | null {
  try {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    return decodeJWTToken(token);
  } catch (error) {
    console.error('현재 사용자 정보 가져오기 실패:', error);
    return null;
  }
}

/**
 * 사용자 이메일을 사용자명으로 변환 (기존 하드코딩된 매핑 사용)
 */
export function getDisplayNameFromEmail(email: string): string {
  // 하드코딩된 매핑 - 실제로는 백엔드에서 사용자 정보를 가져와야 함
  if (email === 'qazplm20099@gmail.com') return '김주민';
  if (email === 'temp@example.com') return '임시사용자';
  
  // 이메일에서 @ 앞부분 추출
  return email.split('@')[0];
}

/**
 * 현재 사용자가 특정 게시글의 작성자인지 확인
 */
export function isCurrentUserPostAuthor(postAuthorName: string): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return false;
  }

  const currentUserDisplayName = getDisplayNameFromEmail(currentUser.sub);
  return currentUserDisplayName === postAuthorName;
}
