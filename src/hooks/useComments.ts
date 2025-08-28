import { useState, useCallback, useEffect } from 'react';

export interface Comment {
  commentId: number;
  content: string;
  author: {
    userId: string;
    nickname: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt?: string;
  likeCount: number;
  liked: boolean;
}

export interface CommentCreateRequest {
  content: string;
}

export interface CommentUpdateRequest {
  content: string;
}

export interface UseCommentsResult {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  createComment: (content: string) => Promise<void>;
  updateComment: (commentId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  toggleCommentLike: (commentId: number) => Promise<void>;
  loadComments: (page?: number) => Promise<void>;
  loadMoreComments: () => Promise<void>;
}

/**
 * 댓글 기능을 위한 커스텀 훅
 * ChatGPT 방식: API 계약 기반 통합
 */
export function useComments(postId: number): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const loadComments = useCallback(async (page = 0) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/posts/${postId}/comments?page=${page}&size=20`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        }
        throw new Error('댓글 목록 조회 실패');
      }

      const data = await response.json();
      
      if (page === 0) {
        setComments(data.content || []);
      } else {
        setComments(prev => [...prev, ...(data.content || [])]);
      }
      
      setHasMore(!data.last);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '댓글 로딩 실패';
      setError(errorMessage);
      console.error('댓글 로딩 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId, isLoading, getAuthHeaders]);

  const loadMoreComments = useCallback(async () => {
    if (hasMore && !isLoading) {
      await loadComments(currentPage + 1);
    }
  }, [hasMore, isLoading, currentPage, loadComments]);

  const createComment = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) {
        throw new Error('댓글 작성 실패');
      }

      const newComment = await response.json();
      
      // 새 댓글을 목록 앞에 추가
      setComments(prev => [newComment, ...prev]);
      
      console.log('댓글 작성 성공:', newComment.commentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 작성 실패');
      console.error('댓글 작성 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [postId, getAuthHeaders]);

  const updateComment = useCallback(async (commentId: number, content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) {
        throw new Error('댓글 수정 실패');
      }

      const updatedComment = await response.json();
      
      // 댓글 목록에서 해당 댓글 업데이트
      setComments(prev => 
        prev.map(comment => 
          comment.commentId === commentId 
            ? { ...comment, content: updatedComment.content }
            : comment
        )
      );
      
      console.log('댓글 수정 성공:', commentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 수정 실패');
      console.error('댓글 수정 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  const deleteComment = useCallback(async (commentId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('댓글 삭제 실패');
      }

      // 댓글 목록에서 해당 댓글 제거
      setComments(prev => prev.filter(comment => comment.commentId !== commentId));
      
      console.log('댓글 삭제 성공:', commentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 삭제 실패');
      console.error('댓글 삭제 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  const toggleCommentLike = useCallback(async (commentId: number) => {
    const comment = comments.find(c => c.commentId === commentId);
    if (!comment) return;

    // Optimistic update
    const previousLiked = comment.liked;
    const previousCount = comment.likeCount;
    
    setComments(prev => 
      prev.map(c => 
        c.commentId === commentId 
          ? { 
              ...c, 
              liked: !c.liked, 
              likeCount: c.liked ? c.likeCount - 1 : c.likeCount + 1 
            }
          : c
      )
    );

    try {
      const response = await fetch(`http://localhost:8080/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('댓글 좋아요 토글 실패');
      }

      const data = await response.json();
      
      // 서버 응답으로 상태 동기화
      setComments(prev => 
        prev.map(c => 
          c.commentId === commentId 
            ? { ...c, liked: data.liked, likeCount: data.likeCount }
            : c
        )
      );
    } catch (err) {
      console.error('댓글 좋아요 토글 실패:', err);
      
      // Rollback optimistic update
      setComments(prev => 
        prev.map(c => 
          c.commentId === commentId 
            ? { ...c, liked: previousLiked, likeCount: previousCount }
            : c
        )
      );
    }
  }, [comments, getAuthHeaders]);

  // 컴포넌트 마운트 시 댓글 로드
  useEffect(() => {
    if (postId) {
      loadComments(0);
    }
  }, [postId]); // loadComments는 의존성에서 제외 (무한 루프 방지)

  return {
    comments,
    isLoading,
    error,
    hasMore,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    loadComments,
    loadMoreComments
  };
}