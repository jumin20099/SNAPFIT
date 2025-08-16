"use client"
import { useState, useEffect, useCallback } from 'react';

interface Comment {
  commentId: number;
  postId: number;
  authorId: string;
  authorName: string;
  authorProfileImage: string;
  content: string;
  parentCommentId?: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface CreateCommentData {
  postId: number;
  content: string;
  parentCommentId?: number;
}

interface UpdateCommentData {
  commentId: number;
  content: string;
}

interface CommentsResponse {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface UseCommentsOptions {
  postId: number;
  pageSize?: number;
}

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  createComment: (data: CreateCommentData) => Promise<Comment | null>;
  updateComment: (data: UpdateCommentData) => Promise<Comment | null>;
  deleteComment: (commentId: number) => Promise<boolean>;
  toggleLike: (commentId: number) => Promise<boolean>;
  loadMore: () => void;
  refresh: () => void;
  resetError: () => void;
}

export function useComments({ postId, pageSize = 20 }: UseCommentsOptions): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchComments = useCallback(async (page: number, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });

      const response = await fetch(`http://localhost:8080/api/posts/${postId}/comments?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `댓글 조회 실패: ${response.status}`);
      }

      const data: CommentsResponse = await response.json();
      console.log('useComments: 댓글 조회 성공', data);

      if (append) {
        setComments(prev => [...prev, ...data.content]);
      } else {
        setComments(data.content);
      }

      setHasMore(!data.last);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '댓글 조회 중 오류가 발생했습니다';
      console.error('useComments: 에러 발생', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [postId, pageSize]);

  const createComment = useCallback(async (data: CreateCommentData): Promise<Comment | null> => {
    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '댓글 생성 실패');
      }

      const newComment: Comment = await response.json();
      console.log('useComments: 댓글 생성 성공', newComment);

      // 새 댓글을 목록에 추가
      setComments(prev => [newComment, ...prev]);

      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '댓글 생성 중 오류가 발생했습니다';
      console.error('useComments: 댓글 생성 에러', err);
      setError(errorMessage);
      return null;
    }
  }, [postId]);

  const updateComment = useCallback(async (data: UpdateCommentData): Promise<Comment | null> => {
    try {
      const response = await fetch(`http://localhost:8080/api/comments/${data.commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: data.content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '댓글 수정 실패');
      }

      const updatedComment: Comment = await response.json();
      console.log('useComments: 댓글 수정 성공', updatedComment);

      // 댓글 목록에서 해당 댓글 업데이트
      setComments(prev => prev.map(comment => 
        comment.commentId === data.commentId ? updatedComment : comment
      ));

      return updatedComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '댓글 수정 중 오류가 발생했습니다';
      console.error('useComments: 댓글 수정 에러', err);
      setError(errorMessage);
      return null;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: number): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '댓글 삭제 실패');
      }

      console.log('useComments: 댓글 삭제 성공', commentId);

      // 댓글 목록에서 해당 댓글 제거
      setComments(prev => prev.filter(comment => comment.commentId !== commentId));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '댓글 삭제 중 오류가 발생했습니다';
      console.error('useComments: 댓글 삭제 에러', err);
      setError(errorMessage);
      return false;
    }
  }, []);

  const toggleLike = useCallback(async (commentId: number): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:8080/api/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '댓글 좋아요 토글 실패');
      }

      const data = await response.json();
      console.log('useComments: 댓글 좋아요 토글 성공', data);

      // 댓글 목록에서 해당 댓글의 좋아요 상태 업데이트
      setComments(prev => prev.map(comment => 
        comment.commentId === commentId 
          ? { ...comment, isLiked: data.isLiked, likeCount: data.likeCount }
          : comment
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '댓글 좋아요 토글 중 오류가 발생했습니다';
      console.error('useComments: 댓글 좋아요 토글 에러', err);
      setError(errorMessage);
      return false;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchComments(currentPage + 1, true);
  }, [loading, hasMore, currentPage, fetchComments]);

  const refresh = useCallback(() => {
    setComments([]);
    setCurrentPage(0);
    setHasMore(true);
    fetchComments(0, false);
  }, [fetchComments]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // 초기 로드
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    comments,
    loading,
    error,
    hasMore,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
    loadMore,
    refresh,
    resetError,
  };
}
