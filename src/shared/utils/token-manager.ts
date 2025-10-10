/**
 * 토큰 관리 유틸리티
 * Access Token과 Refresh Token을 관리하고 자동 갱신을 처리합니다.
 */

import { showTokenRefreshToast } from '@/components/ui/TokenRefreshToast';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  email: string;
  nickname: string;
}

class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;
  private refreshAttempts = 0;
  private maxRefreshAttempts = 3;
  private refreshLock = false;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Access Token을 쿠키에서 가져옵니다.
   * HttpOnly 쿠키이므로 클라이언트에서는 접근할 수 없습니다.
   * 서버에서 자동으로 쿠키를 읽어서 인증을 처리합니다.
   */
  getAccessToken(): string | null {
    // HttpOnly 쿠키는 클라이언트에서 접근할 수 없으므로 null 반환
    // 서버에서 쿠키를 자동으로 읽어서 인증 처리
    return null;
  }

  /**
   * Refresh Token을 쿠키에서 가져옵니다.
   * HttpOnly 쿠키이므로 클라이언트에서는 접근할 수 없습니다.
   * 서버에서 자동으로 쿠키를 읽어서 토큰 갱신을 처리합니다.
   */
  getRefreshToken(): string | null {
    // HttpOnly 쿠키는 클라이언트에서 접근할 수 없으므로 null 반환
    // 서버에서 쿠키를 자동으로 읽어서 토큰 갱신 처리
    return null;
  }

  /**
   * 토큰 쌍을 저장합니다.
   * HttpOnly 쿠키는 서버에서 설정되므로 클라이언트에서는 처리하지 않습니다.
   */
  setTokens(accessToken: string, refreshToken: string): void {
    // HttpOnly 쿠키는 서버에서 설정되므로 클라이언트에서는 처리하지 않음
    console.log('✅ 토큰은 HttpOnly 쿠키에 저장됨 (보안)');
  }

  /**
   * 모든 토큰을 제거합니다.
   * HttpOnly 쿠키는 서버에서 제거되므로 클라이언트에서는 처리하지 않습니다.
   */
  clearTokens(): void {
    // HttpOnly 쿠키는 서버에서 제거되므로 클라이언트에서는 처리하지 않음
    console.log('✅ 토큰은 서버에서 제거됨 (보안)');
  }

  /**
   * Refresh Token을 사용하여 Access Token을 갱신합니다.
   * HttpOnly 쿠키를 사용하므로 서버에서 자동으로 처리됩니다.
   */
  async refreshAccessToken(): Promise<string> {
    // 이미 갱신 중이면 기존 Promise를 반환
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // 락이 걸려있으면 잠시 대기 후 재시도
    if (this.refreshLock) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.refreshAccessToken();
    }

    this.refreshLock = true;
    this.refreshAttempts++;

    try {
      // 토큰 갱신 시작 알림
      showTokenRefreshToast({ type: 'refreshing' });

      this.refreshPromise = this.performRefresh();
      const newAccessToken = await this.refreshPromise;
      
      // 성공 시 카운터 리셋 및 성공 알림
      this.refreshAttempts = 0;
      showTokenRefreshToast({ type: 'success' });
      
      return newAccessToken;

    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      
      // 실패 알림
      showTokenRefreshToast({ 
        type: 'error', 
        message: error instanceof Error ? error.message : '토큰 갱신에 실패했습니다.' 
      });
      
      // 최대 시도 횟수 초과 시 로그아웃
      if (this.refreshAttempts >= this.maxRefreshAttempts) {
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      throw error;
    } finally {
      this.refreshPromise = null;
      this.refreshLock = false;
    }
  }

  /**
   * 실제 토큰 갱신 API 호출
   * HttpOnly 쿠키를 사용하므로 refreshToken을 별도로 전송하지 않습니다.
   */
  private async performRefresh(): Promise<string> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // HttpOnly 쿠키 자동 전송
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || '토큰 갱신에 실패했습니다.');
    }

    const data: RefreshResponse = await response.json();
    
    // HttpOnly 쿠키는 서버에서 자동으로 설정되므로 클라이언트에서는 처리하지 않음
    console.log('✅ 새로운 Access Token이 HttpOnly 쿠키로 설정됨');
    
    return data.accessToken;
  }

  /**
   * 토큰이 유효한지 확인합니다.
   */
  isTokenValid(token: string | null): boolean {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Access Token이 유효한지 확인합니다.
   * HttpOnly 쿠키를 사용하므로 서버에서 검증합니다.
   */
  isAccessTokenValid(): boolean {
    // HttpOnly 쿠키는 클라이언트에서 접근할 수 없으므로 항상 true 반환
    // 실제 검증은 서버에서 수행됩니다.
    return true;
  }

  /**
   * Refresh Token이 유효한지 확인합니다.
   * HttpOnly 쿠키를 사용하므로 서버에서 검증합니다.
   */
  isRefreshTokenValid(): boolean {
    // HttpOnly 쿠키는 클라이언트에서 접근할 수 없으므로 항상 true 반환
    // 실제 검증은 서버에서 수행됩니다.
    return true;
  }

  /**
   * 토큰 갱신이 필요한지 확인합니다.
   * HttpOnly 쿠키를 사용하므로 서버에서 자동으로 처리됩니다.
   */
  shouldRefreshToken(): boolean {
    // HttpOnly 쿠키를 사용하므로 서버에서 자동으로 토큰 갱신을 처리합니다.
    // 클라이언트에서는 401 응답을 받았을 때만 갱신을 시도합니다.
    return false;
  }

  /**
   * 백오프 전략으로 재시도 간격을 계산합니다.
   */
  private getBackoffDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
}

export default TokenManager;
