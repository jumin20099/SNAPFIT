import { useState, useCallback } from 'react';

export interface FollowStatus {
  following: boolean;
  followerCount: number;
}

export interface UseFollowResult {
  isFollowing: boolean;
  followerCount: number;
  isLoading: boolean;
  toggleFollow: () => Promise<void>;
  checkFollowStatus: (userId: string) => Promise<void>;
}

/**
 * 팔로우 기능을 위한 커스텀 훅
 * ChatGPT 방식: 기존 API와 계약 기반 통합
 */
export function useFollow(targetUserId: string): UseFollowResult {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const checkFollowStatus = useCallback(async (userId: string) => {
    try {
      // 사용자명을 UUID로 변환
      const getUserUuid = (username: string) => {
        if (username === '임시사용자') return '4c12cfb2-c5b8-4ff6-96cc-afdb0168830d';
        if (username === '김주민') return '87b18a9c-d2ba-4318-b9aa-859e03c5aad7';
        return username; // 이미 UUID인 경우
      };
      const userUuid = getUserUuid(userId);
      
      const response = await fetch(`http://localhost:8080/api/follows/${userUuid}/status`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        setFollowerCount(data.followerCount || 0);
      }
    } catch (error) {
      console.error('팔로우 상태 확인 실패:', error);
    }
  }, [getAuthHeaders]);

  const toggleFollow = useCallback(async () => {
    if (isLoading || !targetUserId) return;

    setIsLoading(true);
    const previousFollowing = isFollowing;
    const previousCount = followerCount;

    // Optimistic update
    setIsFollowing(!isFollowing);
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);

    try {
      // 사용자명을 UUID로 변환
      const getUserUuid = (username: string) => {
        if (username === '임시사용자') return '4c12cfb2-c5b8-4ff6-96cc-afdb0168830d';
        if (username === '김주민') return '87b18a9c-d2ba-4318-b9aa-859e03c5aad7';
        return username; // 이미 UUID인 경우
      };
      const userUuid = getUserUuid(targetUserId);
      const url = `http://localhost:8080/api/follows/${userUuid}`;
      const method = isFollowing ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`팔로우 ${isFollowing ? '취소' : '요청'} 실패`);
      }

      const data: FollowStatus = await response.json();
      
      // 서버 응답으로 상태 동기화
      setIsFollowing(data.following);
      setFollowerCount(data.followerCount);

      console.log(`팔로우 ${data.following ? '성공' : '취소'}: ${targetUserId}`);
    } catch (error) {
      console.error('팔로우 토글 실패:', error);
      
      // Rollback optimistic update
      setIsFollowing(previousFollowing);
      setFollowerCount(previousCount);
      
      // 사용자에게 에러 표시 (선택적)
      alert(`팔로우 ${isFollowing ? '취소' : '요청'}에 실패했습니다.`);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, isFollowing, followerCount, isLoading, getAuthHeaders]);

  return {
    isFollowing,
    followerCount,
    isLoading,
    toggleFollow,
    checkFollowStatus
  };
}

