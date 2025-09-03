import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { Store } from '@/shared/types';

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => apiClient.getStores(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// 상점 ID로 상점 이름을 찾는 유틸리티 함수
export function useStoreName(storeIdx?: number): string | undefined {
  const { data: stores } = useStores();
  
  if (!storeIdx || !stores) return undefined;
  
  const store = stores.find(s => s.storeIdx === storeIdx);
  return store?.storeName;
}
