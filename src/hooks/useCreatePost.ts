"use client"
import { useState } from 'react';

interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
  mediaUrls: string[];
  anonymousPassword?: string;
}

interface CreatePostResponse {
  postId: number;
  title: string;
  content: string;
  tags: string[];
  mediaUrls: string[];
  authorId: string;
  authorName: string;
  authorProfileImage: string;
  likeCount: number;
  scrapCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  isScrapped: boolean;
}

interface UseCreatePostReturn {
  createPost: (data: CreatePostData) => Promise<CreatePostResponse | null>;
  loading: boolean;
  error: string | null;
  resetError: () => void;
}

export function useCreatePost(): UseCreatePostReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (data: CreatePostData): Promise<CreatePostResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('useCreatePost: 게시글 생성 시작', data);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token && (!data.anonymousPassword || data.anonymousPassword.trim().length < 4)) {
        throw new Error('비밀번호는 4자 이상 입력해주세요.');
      }

      const payload = {
        ...data,
        ...(data.anonymousPassword ? { anonymousPassword: data.anonymousPassword.trim() } : {}),
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `게시글 생성 실패: ${response.status}`);
      }

      const result: CreatePostResponse = await response.json();
      console.log('useCreatePost: 게시글 생성 성공', result);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게시글 생성 중 오류가 발생했습니다';
      console.error('useCreatePost: 에러 발생', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => {
    setError(null);
  };

  return {
    createPost,
    loading,
    error,
    resetError,
  };
}
