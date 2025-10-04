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
   * Access Token을 localStorage에서 가져옵니다.
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    // 기존 'token' 키와 새로운 'accessToken' 키 모두 지원
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  }

  /**
   * Refresh Token을 쿠키에서 가져옵니다. (보안상 localStorage 사용 안함)
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // 쿠키에서 refresh_token 읽기
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'refresh_token') {
        return value;
      }
    }
    return null;
  }

  /**
   * 토큰 쌍을 저장합니다.
   */
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    
    // Access Token만 localStorage에 저장
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('token', accessToken); // 호환성
    
    // Refresh Token은 쿠키에만 저장 (보안상 localStorage 사용 안함)
    // 쿠키는 백엔드에서 설정되므로 여기서는 로그만 출력
    console.log('✅ Refresh Token은 쿠키에 저장됨 (보안)');
  }

  /**
   * 모든 토큰을 제거합니다.
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    // localStorage에서 Access Token만 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token'); // 기존 토큰도 제거
    
    // Refresh Token은 쿠키에 있으므로 백엔드에서 제거
    // 여기서는 로그만 출력
    console.log('✅ Refresh Token은 백엔드에서 제거됨 (보안)');
  }

  /**
   * Refresh Token을 사용하여 Access Token을 갱신합니다.
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
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token이 없습니다.');
      }

      // 토큰 갱신 시작 알림
      showTokenRefreshToast({ type: 'refreshing' });

      this.refreshPromise = this.performRefresh(refreshToken);
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
   */
  private async performRefresh(refreshToken: string): Promise<string> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || '토큰 갱신에 실패했습니다.');
    }

    const data: RefreshResponse = await response.json();
    
    // 새로운 Access Token 저장
    this.setTokens(data.accessToken, refreshToken);
    
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
   */
  isAccessTokenValid(): boolean {
    const accessToken = this.getAccessToken();
    return this.isTokenValid(accessToken);
  }

  /**
   * Refresh Token이 유효한지 확인합니다.
   */
  isRefreshTokenValid(): boolean {
    const refreshToken = this.getRefreshToken();
    return this.isTokenValid(refreshToken);
  }

  /**
   * 토큰 갱신이 필요한지 확인합니다.
   */
  shouldRefreshToken(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      
      // 만료 5분 전에 갱신
      return timeUntilExpiry < 300;
    } catch {
      return true;
    }
  }

  /**
   * 백오프 전략으로 재시도 간격을 계산합니다.
   */
  private getBackoffDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
}

export default TokenManager;
