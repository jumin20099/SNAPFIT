import { useState, useCallback } from 'react';

interface UseDeletePostResult {
  isDeleting: boolean;
  deletePost: (postId: number, anonymousPassword?: string) => Promise<boolean>;
}

/**
 * 게시글 삭제 기능을 위한 커스텀 훅
 */
export function useDeletePost(): UseDeletePostResult {
  const [isDeleting, setIsDeleting] = useState(false);

  const getAuthHeaders = useCallback((hasBody: boolean) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }, []);

  const deletePost = useCallback(async (postId: number, anonymousPassword?: string): Promise<boolean> => {
    setIsDeleting(true);
    
    try {
      console.log('게시글 삭제 요청:', postId);
      const hasBody = typeof anonymousPassword === 'string' && anonymousPassword.trim().length > 0;
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(hasBody),
        credentials: 'include',
        ...(hasBody ? { body: JSON.stringify({ anonymousPassword: anonymousPassword?.trim() }) } : {}),
      });

      if (response.ok) {
        console.log('게시글 삭제 성공');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('게시글 삭제 실패:', response.status, errorData);
        
        if (response.status === 403) {
          alert('게시글 삭제 권한이 없습니다.');
        } else if (response.status === 404) {
          alert('게시글을 찾을 수 없습니다.');
        } else {
          alert('게시글 삭제 중 오류가 발생했습니다.');
        }
        return false;
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [getAuthHeaders]);

  return {
    isDeleting,
    deletePost
  };
}
