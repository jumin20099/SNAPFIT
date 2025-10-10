/**
 * 인증 관련 훅
 * 로그인, 로그아웃, 토큰 관리 등을 처리합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TokenManager from '@/shared/utils/token-manager';
import ApiClient from '@/shared/utils/api-client';

interface User {
  email: string;
  nickname: string;
  role: string;
  accessToken?: string;
  refreshToken?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  nickname: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const tokenManager = TokenManager.getInstance();
  const apiClient = ApiClient.getInstance();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * 현재 사용자 정보 조회
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const userData = await apiClient.get<User>('/api/auth/me');
      
      // HttpOnly 쿠키를 사용하므로 localStorage에 토큰 저장하지 않음
      // if (userData.accessToken && userData.refreshToken) {
      //   tokenManager.setTokens(userData.accessToken, userData.refreshToken);
      // }
      
      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: '사용자 정보를 불러올 수 없습니다.',
      });
    }
  }, [apiClient]);

  /**
   * 로그인 처리
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // 실제 로그인 API 호출 (구현 필요)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '로그인에 실패했습니다.');
      }

      const data: LoginResponse = await response.json();
      
      // 토큰 저장
      tokenManager.setTokens(data.accessToken, data.refreshToken);
      
      setAuthState({
        user: {
          email: data.email,
          nickname: data.nickname,
          role: 'USER',
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [tokenManager]);

  /**
   * 로그아웃 처리
   */
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // 서버에 로그아웃 요청
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    } finally {
      // 토큰 제거
      tokenManager.clearTokens();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // 로그인 페이지로 리다이렉트
      router.push('/login');
    }
  }, [tokenManager, router]);

  /**
   * 토큰 갱신
   */
  const refreshTokenFunction = useCallback(async () => {
    try {
      const newAccessToken = await tokenManager.refreshAccessToken();
      return { success: true, accessToken: newAccessToken };
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      await logout();
      return { success: false, error: error instanceof Error ? error.message : '토큰 갱신에 실패했습니다.' };
    }
  }, [tokenManager, logout]);

  /**
   * 인증 상태 초기화
   */
  const initializeAuth = useCallback(async () => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();

    if (!accessToken || !refreshToken) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    if (!tokenManager.isAccessTokenValid()) {
      if (tokenManager.isRefreshTokenValid()) {
        // Access Token이 만료되었지만 Refresh Token이 유효한 경우
        try {
          await refreshTokenFunction();
          await fetchCurrentUser();
        } catch (error) {
          console.error('토큰 갱신 및 사용자 정보 조회 실패:', error);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        // Refresh Token도 만료된 경우
        tokenManager.clearTokens();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } else {
      // Access Token이 유효한 경우
      await fetchCurrentUser();
    }
  }, [tokenManager, refreshTokenFunction, fetchCurrentUser]);

  /**
   * 컴포넌트 마운트 시 인증 상태 초기화
   */
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * 주기적으로 토큰 갱신 확인
   */
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkTokenExpiry = () => {
      if (tokenManager.shouldRefreshToken()) {
        refreshTokenFunction();
      }
    };

    // 1분마다 토큰 만료 확인
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, tokenManager, refreshTokenFunction]);

  return {
    ...authState,
    login,
    logout,
    refreshToken: refreshTokenFunction,
    initializeAuth,
  };
}
