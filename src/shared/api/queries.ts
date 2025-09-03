import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Product, Post, User, Notification } from './types';

// 상품 관련 쿼리
export function useCategoryProducts(major: string, sub?: string) {
  return useQuery({
    queryKey: ['products', 'category', major, sub],
    queryFn: () => apiClient.getProductsByCategory(major, sub),
    enabled: !!major,
    staleTime: 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.getProductById(id),
    enabled: !!id,
  });
}

export function useSearchProducts(keyword: string, type: string = 'all') {
  return useQuery({
    queryKey: ['products', 'search', keyword, type],
    queryFn: () => apiClient.searchProducts(keyword, type),
    enabled: !!keyword.trim(),
    staleTime: 30 * 1000, // 30초
  });
}

// 포스트 관련 쿼리
export function usePosts(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['posts', page, size],
    queryFn: () => apiClient.getPosts(page, size),
    staleTime: 30 * 1000,
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => apiClient.getPostById(id),
    enabled: !!id,
  });
}

// 좋아요 관련 뮤테이션
export function useToggleLike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ targetIdx, targetType }: { targetIdx: number; targetType: 'product' | 'brand' | 'outfit' }) =>
      apiClient.toggleLike(targetIdx, targetType),
    onSuccess: (data, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// 스크랩 관련 뮤테이션
export function useToggleScrap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => apiClient.toggleScrap(postId),
    onSuccess: (data, postId) => {
      // 포스트 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// 알림 관련 쿼리
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.getNotifications(),
    staleTime: 10 * 1000, // 10초
    refetchInterval: 30 * 1000, // 30초마다 자동 새로고침
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => apiClient.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// 사용자 관련 쿼리
export function useUserInfo() {
  return useQuery({
    queryKey: ['user', 'info'],
    queryFn: () => apiClient.getUserInfo(),
    staleTime: 5 * 60 * 1000, // 5분
  });
}
