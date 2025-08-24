import { useState, useCallback } from 'react';

interface UseDeletePostResult {
  isDeleting: boolean;
  deletePost: (postId: number) => Promise<boolean>;
}

/**
 * 게시글 삭제 기능을 위한 커스텀 훅
 */
export function useDeletePost(): UseDeletePostResult {
  const [isDeleting, setIsDeleting] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const deletePost = useCallback(async (postId: number): Promise<boolean> => {
    setIsDeleting(true);
    
    try {
      console.log('게시글 삭제 요청:', postId);
      
      const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log('게시글 삭제 성공:', data);
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
