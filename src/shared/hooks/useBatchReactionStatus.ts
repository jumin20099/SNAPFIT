import { useQuery } from '@tanstack/react-query';

interface BatchReactionStatusOptions {
  postIds?: number[];
  productIds?: number[];
  commentIds?: number[];
  enabled?: boolean;
}

interface ReactionStatus {
  liked: boolean;
  scraped?: boolean;
  likeCount: number;
  scrapCount?: number;
}

interface BatchReactionStatusResult {
  [key: string]: ReactionStatus;
}

export function useBatchReactionStatus({
  postIds = [],
  productIds = [],
  commentIds = [],
  enabled = true
}: BatchReactionStatusOptions) {
  const hasIds = postIds.length > 0 || productIds.length > 0 || commentIds.length > 0;

  return useQuery<BatchReactionStatusResult>({
    queryKey: ['batchReactionStatus', postIds, productIds, commentIds],
    queryFn: async () => {
      if (!hasIds) return {};

      const token = localStorage.getItem('token');
      if (!token) return {};

      const response = await fetch('/api/reactions/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postIds, productIds, commentIds })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    enabled: enabled && hasIds,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
}
