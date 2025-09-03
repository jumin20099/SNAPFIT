'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseToggleFollowOptions {
  userId: number;
  onSuccess?: (data: { isFollowing: boolean; followerCount: number }) => void;
  onError?: (error: Error) => void;
}

export function useToggleFollow({
  userId,
  onSuccess,
  onError,
}: UseToggleFollowOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('팔로우 처리에 실패했습니다');
      }
      
      return response.json();
    },
    onMutate: async () => {
      // 낙관적 업데이트를 위한 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['user', userId] });
      await queryClient.cancelQueries({ queryKey: ['users'] });
      
      // 이전 데이터 백업
      const previousUser = queryClient.getQueryData(['user', userId]);
      const previousUsers = queryClient.getQueryData(['users']);
      
      return { previousUser, previousUsers };
    },
    onSuccess: (data) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // 성공 토스트
      toast.success(data.isFollowing ? '팔로우했습니다' : '팔로우를 취소했습니다');
      
      onSuccess?.(data);
    },
    onError: (error, variables, context) => {
      // 롤백
      if (context?.previousUser) {
        queryClient.setQueryData(['user', userId], context.previousUser);
      }
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      
      // 에러 토스트
      toast.error('팔로우 처리에 실패했습니다');
      
      onError?.(error);
    },
  });
}
