import { useState, useCallback } from 'react';

/**
 * 차단 시스템 훅
 * E2E 테스트 통과를 위한 최소 구현
 */

interface BlockedUser {
  blockedUserId: string;
  blockedUserNickname: string;
  reason?: string;
  createdAt: string;
}

interface BlockResponse {
  blocked: boolean;
  blockedUserId: string;
  blockedUserNickname: string;
  message: string;
}

interface BlockListResponse {
  content: BlockedUser[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export function useBlock() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 사용자 차단
   */
  const blockUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리

      const url = new URL(`http://localhost:8080/api/blocks/${userId}`);
      if (reason) {
        url.searchParams.append('reason', reason);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // HttpOnly 쿠키 자동 전송
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `차단 실패: ${response.statusText}`);
      }

      const result: BlockResponse = await response.json();
      console.log(`사용자 ${userId} 차단 성공:`, result);
      return true;
      
    } catch (err: any) {
      console.error('사용자 차단 오류:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 차단 해제
   */
  const unblockUser = useCallback(async (userId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리

      const url = new URL(`http://localhost:8080/api/blocks/${userId}`);

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // HttpOnly 쿠키 자동 전송
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `차단 해제 실패: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`사용자 ${userId} 차단 해제 성공:`, result);
      return true;
      
    } catch (err: any) {
      console.error('차단 해제 오류:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 차단 상태 확인
   */
  const checkBlockStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리

      const url = new URL(`http://localhost:8080/api/blocks/check/${userId}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include' // HttpOnly 쿠키 자동 전송
      });

      if (!response.ok) {
        console.warn(`차단 상태 확인 실패: ${response.statusText}`);
        return false;
      }

      const result = await response.json();
      return result.isBlocked || false;
      
    } catch (err: any) {
      console.error('차단 상태 확인 오류:', err);
      return false;
    }
  }, []);

  /**
   * 내 차단 목록 조회
   */
  const getBlockedUsers = useCallback(async (page: number = 0, size: number = 20): Promise<BlockedUser[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리

      const url = new URL('http://localhost:8080/api/blocks/my');
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', size.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include' // HttpOnly 쿠키 자동 전송
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `차단 목록 조회 실패: ${response.statusText}`);
      }

      const result: BlockListResponse = await response.json();
      return result.content || [];
      
    } catch (err: any) {
      console.error('차단 목록 조회 오류:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    blockUser,
    unblockUser,
    checkBlockStatus,
    getBlockedUsers,
    isLoading,
    error
  };
}
