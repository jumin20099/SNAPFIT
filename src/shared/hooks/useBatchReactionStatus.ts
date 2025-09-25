import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { BatchReactionStatusResult } from '@/shared/types';
import { validateBatchReactionStatus, createBatchReactionManager, BatchReactionStatusManager } from '@/shared/utils/batch-reaction-utils';

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
      if (!hasIds) return {};

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/reactions/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ postIds, productIds, commentIds })
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {};
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // 타입 검증 수행
      if (!validateBatchReactionStatus(data)) {
        console.warn('Invalid batch reaction status data received:', data);
        return {};
      }

      return data;
    },
    enabled: enabled && hasIds,
    staleTime: 30 * 1000, // 30초 (댓글 상태 변경 시 빠른 반영)
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
