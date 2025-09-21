'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { toast } from 'sonner';

interface UseToggleScrapOptions {
  postId: number;
  onSuccess?: (data: { isScrapped: boolean; scrapCount: number }) => void;
  onError?: (error: Error) => void;
}

export function useToggleScrap({
  postId,
  onSuccess,
  onError,
}: UseToggleScrapOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.toggleScrap(postId),
    onMutate: async () => {
      // 낙관적 업데이트를 위한 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['posts', postId] });
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // 이전 데이터 백업
      const previousPost = queryClient.getQueryData(['posts', postId]);
      const previousPosts = queryClient.getQueryData(['posts']);
      
      return { previousPost, previousPosts };
    },
    onSuccess: (data) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // 성공 토스트
      toast.success(data.scraped ? '스크랩했습니다' : '스크랩을 취소했습니다');
      
      onSuccess?.(data);
    },
    onError: (error, variables, context) => {
      // 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      
      // 에러 토스트
      toast.error('스크랩 처리에 실패했습니다');
      
      onError?.(error);
    },
  });
}
