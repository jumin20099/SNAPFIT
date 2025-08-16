"use client"
import { useState, useEffect } from 'react';

interface ToggleFollowOptions {
  initialFollowing: boolean;
  initialFollowerCount: number;
  targetUserId: string;
}

interface FollowToggleResponse {
  targetUserId: string;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

export function useToggleFollow({ initialFollowing, initialFollowerCount, targetUserId }: ToggleFollowOptions) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);

  // initialFollowing과 initialFollowerCount가 변경될 때 상태 업데이트
  useEffect(() => {
    setFollowing(initialFollowing);
    setFollowerCount(initialFollowerCount);
  }, [initialFollowing, initialFollowerCount]);

  const toggle = async () => {
    if (loading) return;
    
    console.log('useToggleFollow: 팔로우 토글 시작', { following, followerCount, targetUserId });
    
    // 낙관적 업데이트
    setFollowing((prev) => !prev);
    setFollowerCount((prev) => (following ? prev - 1 : prev + 1));

    setLoading(true);
    try {
      const response = await fetch(`/api/follows/${targetUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '팔로우 토글 실패');
      }
      
      const data: FollowToggleResponse = await response.json();
      console.log('useToggleFollow: API 응답', data);
      
      // 서버 응답으로 상태 업데이트
      setFollowing(data.isFollowing);
      setFollowerCount(data.followerCount);
    } catch (err) {
      console.error('useToggleFollow: 에러 발생', err);
      // 롤백
      setFollowing((prev) => !prev);
      setFollowerCount((prev) => (following ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  };

  return { following, followerCount, loading, toggle };
}
