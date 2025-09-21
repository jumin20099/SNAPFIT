'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { toast } from 'sonner';

interface UseToggleCommentLikeOptions {
  commentId: number;
  onSuccess?: (data: { liked: boolean; likeCount: number }) => void;
  onError?: (error: Error) => void;
}

export function useToggleCommentLike({
  commentId,
  onSuccess,
  onError,
}: UseToggleCommentLikeOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.toggleCommentLike(commentId),
    onMutate: async () => {
      // 관련 쿼리 무효화
      await queryClient.cancelQueries({ queryKey: ['comments'] });
      
      // 낙관적 업데이트
      const previousComments = queryClient.getQueryData(['comments']);
      
      queryClient.setQueryData(['comments'], (old: any) => {
        if (!old) return old;
        
        return old.map((comment: any) => 
          comment.commentId === commentId 
            ? { 
                ...comment, 
                liked: !comment.liked,
                likeCount: comment.liked ? comment.likeCount - 1 : comment.likeCount + 1
              }
            : comment
        );
      });
      
      return { previousComments };
    },
    onSuccess: (data) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      // 배치 상태 조회도 무효화하여 최신 상태 반영
      queryClient.invalidateQueries({ queryKey: ['batchReactionStatus'] });
      
      // 성공 토스트
      toast.success(data.liked ? '댓글을 좋아요했습니다' : '댓글 좋아요를 취소했습니다');
      
      onSuccess?.(data);
    },
    onError: (error, variables, context) => {
      // 롤백
      if (context?.previousComments) {
        queryClient.setQueryData(['comments'], context.previousComments);
      }
      
      console.error('댓글 좋아요 토글 실패:', error);
      toast.error('댓글 좋아요 처리 중 오류가 발생했습니다');
      
      onError?.(error);
    },
  });
}
