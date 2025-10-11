import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { BatchReactionStatusResult } from '@/shared/types';
import { validateBatchReactionStatus, createBatchReactionManager, BatchReactionStatusManager } from '@/shared/utils/batch-reaction-utils';
import { addCsrfTokenToHeaders } from '@/lib/csrf-utils';

interface BatchReactionStatusOptions {
  postIds?: number[];
  productIds?: number[];
  commentIds?: number[];
  enabled?: boolean;
}

interface BatchReactionStatusHookResult {
  data?: BatchReactionStatusResult;
  manager: BatchReactionStatusManager;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBatchReactionStatus({
  postIds = [],
  productIds = [],
  commentIds = [],
  enabled = true
}: BatchReactionStatusOptions): BatchReactionStatusHookResult {
  const hasIds = postIds.length > 0 || productIds.length > 0 || commentIds.length > 0;

  const query = useQuery<BatchReactionStatusResult>({
    queryKey: ['batchReactionStatus', postIds, productIds, commentIds],
    queryFn: async () => {
      console.log('useBatchReactionStatus queryFn 실행:', { 
        postIds, 
        productIds, 
        commentIds, 
        hasIds, 
        enabled 
      });
      
      if (!hasIds) {
        console.log('ID가 없어서 빈 객체 반환');
        return {};
      }

      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리
      let cookies = typeof document !== 'undefined' ? document.cookie : '';
      
      // snapfit_guest_id 쿠키가 없으면 기존 ID로 생성
      if (typeof window !== 'undefined' && !cookies.includes('snapfit_guest_id')) {
        const guestId = '-1159250824'; // 기존 게스트 ID 사용
        document.cookie = `snapfit_guest_id=${guestId}; path=/; max-age=86400`;
        cookies = document.cookie;
        console.log('게스트 쿠키 생성 (기존 ID 사용):', guestId);
      }
      
      console.log('API 요청 시작:', { 
        cookies: cookies ? '있음' : '없음',
        cookieValue: cookies.includes('snapfit_guest_id') ? cookies.split('snapfit_guest_id=')[1]?.split(';')[0] : '없음',
        postIds, 
        productIds, 
        commentIds 
      });
      
      // CSRF 토큰 가져오기 디버깅
      console.log('CSRF 토큰 가져오기 시작...');
      const csrfHeaders = await addCsrfTokenToHeaders({
        'Content-Type': 'application/json',
      });
      console.log('CSRF 헤더:', csrfHeaders);
      
      const response = await fetch('/api/reactions/status', {
        method: 'POST',
        headers: csrfHeaders,
        credentials: 'include', // HttpOnly 쿠키 자동 전송
        body: JSON.stringify({ postIds, productIds, commentIds })
      });

      console.log('API 응답:', { 
        status: response.status, 
        ok: response.ok 
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('401 에러 - 빈 객체 반환');
          return {};
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API 응답 데이터:', data);
      
      // 타입 검증 수행
      if (!validateBatchReactionStatus(data)) {
        console.warn('Invalid batch reaction status data received:', data);
        return {};
      }

      console.log('유효한 데이터 반환:', data);
      return data;
    },
    enabled: enabled && hasIds,
    staleTime: 0, // 항상 새로운 데이터 가져오기 (새로고침 후 상태 동기화)
    gcTime: 2 * 60 * 1000, // 2분
  });

  // 타입 안전한 매니저 객체 생성
  const manager = useMemo(() => createBatchReactionManager(query.data), [query.data]);

  return {
    data: query.data,
    manager,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}
