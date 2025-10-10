import { useState, useCallback, useEffect, useRef } from 'react';

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
  
  // 무한 루프 방지를 위한 ref 사용
  const isLoadingRef = useRef(false);

  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json'
    };
  }, []);

  const loadComments = useCallback(async (page = 0) => {
    if (isLoadingRef.current) return;

    console.log('=== 댓글 로딩 시작 ===', { postId, page });
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/posts/${postId}/comments?page=${page}&size=20`, {
        headers,
        credentials: 'include' // HttpOnly 쿠키 자동 전송
      });

      console.log('댓글 API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        }
        throw new Error('댓글 목록 조회 실패');
      }

      const data = await response.json();
      console.log('댓글 API 응답 데이터:', data);
      console.log('댓글 개수:', data.content?.length || 0);
      
      if (page === 0) {
        console.log('=== 댓글 상태 설정 전 ===', { 
          기존댓글수: comments.length, 
          새댓글수: data.content?.length || 0 
        });
        setComments(data.content || []);
        console.log('초기 댓글 설정 완료:', data.content?.length || 0, '개');
        console.log('설정된 댓글 데이터:', data.content);
      } else {
        setComments(prev => {
          const newComments = [...prev, ...(data.content || [])];
          console.log('댓글 추가 후 총 개수:', newComments.length, '개');
          return newComments;
        });
      }
      
      setHasMore(!data.last);
      setCurrentPage(page);
      console.log('댓글 로딩 완료:', { 
        currentCount: data.content?.length || 0, 
        hasMore: !data.last, 
        page 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '댓글 로딩 실패';
      setError(errorMessage);
      console.error('댓글 로딩 실패:', err);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [postId, getAuthHeaders]);

  const loadMoreComments = useCallback(async () => {
    console.log('=== 댓글 더보기 시작 ===', { 
      hasMore, 
      isLoading: isLoadingRef.current, 
      currentPage, 
      currentCommentCount: comments.length 
    });
    
    if (hasMore && !isLoadingRef.current) {
      const nextPage = currentPage + 1;
      console.log('다음 페이지 로딩:', nextPage);
      try {
        await loadComments(nextPage);
        console.log('댓글 더보기 완료:', { 
          이전페이지: currentPage, 
          새페이지: nextPage,
          총댓글수: comments.length 
        });
      } catch (error) {
        console.error('댓글 더보기 실패:', error);
      }
    } else {
      console.log('댓글 더보기 조건 불충족:', { hasMore, isLoading: isLoadingRef.current });
    }
  }, [hasMore, currentPage, loadComments, comments.length]);

  const createComment = useCallback(async (content: string) => {
    if (!content.trim()) return;

    console.log('=== 댓글 작성 시작 ===', { postId, content: content.trim() });
    
    // 댓글 작성 중에는 별도 상태 사용
    const setCommentLoading = (loading: boolean) => {
      // 댓글 작성 중에는 전체 로딩 상태를 변경하지 않음
      console.log('댓글 작성 로딩 상태:', loading);
    };
    
    setCommentLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include', // HttpOnly 쿠키 자동 전송
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) {
        throw new Error('댓글 작성 실패');
      }

      const newComment = await response.json();
      console.log('새 댓글 생성 성공:', newComment);
      
      // 새 댓글을 목록 앞에 추가
      setComments(prev => {
        const updatedComments = [newComment, ...prev];
        console.log('댓글 목록 업데이트:', updatedComments.length, '개');
        return updatedComments;
      });
      
      console.log('댓글 작성 성공:', newComment.commentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 작성 실패');
      console.error('댓글 작성 실패:', err);
      throw err;
    } finally {
      setCommentLoading(false);
    }
  }, [postId, getAuthHeaders]);

  const updateComment = useCallback(async (commentId: number, content: string) => {
    if (!content.trim()) return;

    console.log('=== 댓글 수정 시작 ===', { commentId, content: content.trim() });
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include', // HttpOnly 쿠키 자동 전송
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
    }
  }, [getAuthHeaders]);

  const deleteComment = useCallback(async (commentId: number) => {
    console.log('=== 댓글 삭제 시작 ===', { commentId });
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include' // HttpOnly 쿠키 자동 전송
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
        headers: getAuthHeaders(),
        credentials: 'include' // HttpOnly 쿠키 자동 전송
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

  // 댓글 상태 변화 감지
  useEffect(() => {
    console.log('=== 댓글 상태 변화 감지 ===', { 
      댓글수: comments.length, 
      댓글데이터: comments,
      로딩중: isLoading,
      에러: error,
      더보기: hasMore
    });
  }, [comments, isLoading, error, hasMore]);

  // 컴포넌트 마운트 시 댓글 로드
  useEffect(() => {
    if (postId) {
      console.log('=== useComments useEffect 실행 ===', { postId });
      loadComments(0);
    }
  }, [postId]); // loadComments를 의존성에서 제거하여 무한 루프 방지

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