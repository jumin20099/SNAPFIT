import { useState, useCallback } from 'react';

/**
 * 신고 시스템 훅
 * E2E 테스트 통과를 위한 최소 구현
 */

export interface ReportRequest {
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId?: number;
  targetUserId?: string;
  category?: 'SPAM' | 'INAPPROPRIATE_CONTENT' | 'HARASSMENT' | 'OTHER';
  reason: string | null;
}

interface ReportResponse {
  success: boolean;
  reportId?: number;
  targetType?: string;
  targetId?: number;
  targetUserId?: string;
  category?: string;
  reason?: string;
  status?: string;
  message?: string;
  report?: Report;
}

export interface Report {
  reportId: number;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId?: number;
  targetUserId?: string;
  category: 'SPAM' | 'INAPPROPRIATE_CONTENT' | 'HARASSMENT' | 'OTHER';
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
      const payload: Record<string, unknown> = {
        targetType: reportData.targetType,
        category: reportData.category || 'OTHER',
        reason: reportData.reason,
      };

      if (reportData.targetType === 'USER') {
        payload.targetUserId = reportData.targetUserId;
      }

      if (reportData.targetId !== undefined && reportData.targetId !== null) {
        payload.targetId = reportData.targetId;
        if (reportData.targetType === 'POST') {
          payload.reportedPostId = reportData.targetId;
        }
        if (reportData.targetType === 'COMMENT') {
          payload.reportedCommentId = reportData.targetId;
        }
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // HttpOnly 쿠키 자동 전송
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `신고 실패: ${response.statusText}`);
      }

      const result: ReportResponse = await response.json();
      console.log('신고 생성 성공:', result);
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
      const params = new URLSearchParams({
        scope: 'my',
        page: page.toString(),
        size: size.toString()
      });

      const response = await fetch(`/api/reports?${params.toString()}`, {
        method: 'GET',
        credentials: 'include', // HttpOnly 쿠키 자동 전송
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
  const reportPost = useCallback(async (postId: number, reason: string, category?: ReportRequest['category']): Promise<boolean> => {
    return createReport({
      targetType: 'POST',
      targetId: postId,
      reason,
      category
    });
  }, [createReport]);

  /**
   * 댓글 신고
   */
  const reportComment = useCallback(async (commentId: number, reason: string, category?: ReportRequest['category']): Promise<boolean> => {
    return createReport({
      targetType: 'COMMENT',
      targetId: commentId,
      reason,
      category
    });
  }, [createReport]);

  /**
   * 사용자 신고
   */
  const reportUser = useCallback(async (userId: string, reason: string, category?: ReportRequest['category']): Promise<boolean> => {
    return createReport({
      targetType: 'USER',
      targetUserId: userId,
      reason,
      category
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
