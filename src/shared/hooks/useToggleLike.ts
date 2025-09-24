'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { toast } from 'sonner';

interface UseToggleLikeOptions {
  targetIdx: number;
  targetType: 'product' | 'brand' | 'outfit' | 'post';
  onSuccess?: (data: { liked: boolean; count: number }) => void;
  onError?: (error: Error) => void;
}

export function useToggleLike({
  targetIdx,
  targetType,
  onSuccess,
  onError,
}: UseToggleLikeOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.toggleLike(targetIdx, targetType),
    onMutate: async () => {
      // 낙관적 업데이트를 위한 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['products'] });
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // 이전 데이터 백업
      const previousProducts = queryClient.getQueryData(['products']);
      const previousPosts = queryClient.getQueryData(['posts']);
      
      return { previousProducts, previousPosts };
    },
    onSuccess: (data) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // 배치 상태 조회도 무효화하여 최신 상태 반영
      queryClient.invalidateQueries({ queryKey: ['batchReactionStatus'] });
      
      // 성공 토스트
      toast.success(data.liked ? '좋아요를 눌렀습니다' : '좋아요를 취소했습니다');
      
      onSuccess?.(data);
    },
    onError: (error, variables, context) => {
      // 롤백
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      
      // 에러 토스트
      toast.error('좋아요 처리에 실패했습니다');
      
      onError?.(error);
    },
  });
}
