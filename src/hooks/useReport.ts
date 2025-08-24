import { useState, useCallback } from 'react';

/**
 * 신고 시스템 훅
 * E2E 테스트 통과를 위한 최소 구현
 */

interface ReportRequest {
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: number;
  reason: string;
}

interface ReportResponse {
  success: boolean;
  reportId: number;
  targetType: string;
  targetId: number;
  reason: string;
  status: string;
  message: string;
}

interface Report {
  reportId: number;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: number;
  reason: string;
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface ReportListResponse {
  content: Report[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export function useReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 신고 생성
   */
  const createReport = useCallback(async (reportData: ReportRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const url = new URL('http://localhost:8080/api/reports');
      url.searchParams.append('token', token);
      url.searchParams.append('targetType', reportData.targetType);
      url.searchParams.append('targetId', reportData.targetId.toString());
      url.searchParams.append('reason', reportData.reason);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `신고 실패: ${response.statusText}`);
      }

      const result: ReportResponse = await response.json();
      console.log(`신고 생성 성공:`, result);
      return true;
      
    } catch (err: any) {
      console.error('신고 생성 오류:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 내 신고 목록 조회
   */
  const getMyReports = useCallback(async (page: number = 0, size: number = 20): Promise<Report[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const url = new URL('http://localhost:8080/api/reports/my');
      url.searchParams.append('token', token);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', size.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `신고 목록 조회 실패: ${response.statusText}`);
      }

      const result: ReportListResponse = await response.json();
      return result.content || [];
      
    } catch (err: any) {
      console.error('신고 목록 조회 오류:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 게시글 신고
   */
  const reportPost = useCallback(async (postId: number, reason: string): Promise<boolean> => {
    return createReport({
      targetType: 'POST',
      targetId: postId,
      reason
    });
  }, [createReport]);

  /**
   * 댓글 신고
   */
  const reportComment = useCallback(async (commentId: number, reason: string): Promise<boolean> => {
    return createReport({
      targetType: 'COMMENT',
      targetId: commentId,
      reason
    });
  }, [createReport]);

  /**
   * 사용자 신고
   */
  const reportUser = useCallback(async (userId: number, reason: string): Promise<boolean> => {
    return createReport({
      targetType: 'USER',
      targetId: userId,
      reason
    });
  }, [createReport]);

  return {
    createReport,
    reportPost,
    reportComment,
    reportUser,
    getMyReports,
    isLoading,
    error
  };
}
