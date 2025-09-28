/**
 * 배치 반응 상태 유틸리티 함수들
 * 타입 안전성을 보장하며 any 타입 사용을 방지
 */

import type { BatchReactionStatusResult, ReactionStatusItem } from '@/shared/types';

/**
 * 타입 안전한 배치 상태 접근 클래스
 */
export class BatchReactionStatusManager {
  constructor(private data?: BatchReactionStatusResult) {}

  /**
   * 상품 반응 상태 조회
   */
  getProductStatus(productId: string | number): ReactionStatusItem | undefined {
    if (!this.data) return undefined;
    const key = `product_${productId}` as const;
    return this.data[key];
  }

  /**
   * 게시글 반응 상태 조회
   */
  getPostStatus(postId: string | number): ReactionStatusItem | undefined {
    if (!this.data) return undefined;
    const key = `post_${postId}` as const;
    return this.data[key];
  }

  /**
   * 댓글 반응 상태 조회
   */
  getCommentStatus(commentId: string | number): ReactionStatusItem | undefined {
    if (!this.data) return undefined;
    const key = `comment_${commentId}` as const;
    return this.data[key];
  }

  /**
   * 상품의 좋아요 상태 확인
   */
  isProductLiked(productId: string | number): boolean {
    return this.getProductStatus(productId)?.liked ?? false;
  }

  /**
   * 게시글의 스크랩 상태 확인
   */
  isPostScraped(postId: string | number): boolean {
    return this.getPostStatus(postId)?.scraped ?? false;
  }

  /**
   * 안전한 좋아요 수 조회
   */
  getLikeCount(targetType: 'product' | 'post' | 'comment', targetId: string | number): number {
    switch (targetType) {
      case 'product':
        return this.getProductStatus(targetId)?.likeCount ?? 0;
      case 'post':
        return this.getPostStatus(targetId)?.likeCount ?? 0;
      case 'comment':
        return this.getCommentStatus(targetId)?.likeCount ?? 0;
      default:
        return 0;
    }
  }

  /**
   * 특정 게시글 상태를 업데이트 (비동기 이벤트 대응)
   */
  updatePost(postId: string | number, updates: Partial<ReactionStatusItem>) {
    if (!this.data) return;
    const key = `post_${postId}` as const;
    const current = this.data[key] || { liked: false, likeCount: 0 };
    this.data[key] = {
      ...current,
      ...updates,
      likeCount: updates.likeCount ?? current.likeCount ?? 0,
      scrapCount: updates.scrapCount ?? current.scrapCount ?? 0,
    };
  }
}

/**
 * 팩토리 함수 - 더 간편한 사용을 위해
 */
export function createBatchReactionManager(data?: BatchReactionStatusResult): BatchReactionStatusManager {
  return new BatchReactionStatusManager(data);
}

/**
 * 타입 가드 함수
 */
export function isValidReactionStatusItem(data: unknown): data is ReactionStatusItem {
  if (typeof data !== 'object' || data === null) return false;
  
  const item = data as Record<string, unknown>;
  return (
    typeof item.liked === 'boolean' &&
    typeof item.likeCount === 'number' &&
    (item.scraped === undefined || typeof item.scraped === 'boolean') &&
    (item.scrapCount === undefined || typeof item.scrapCount === 'number')
  );
}

/**
 * 배치 반응 상태 데이터 검증
 */
export function validateBatchReactionStatus(data: unknown): data is BatchReactionStatusResult {
  if (typeof data !== 'object' || data === null) return false;
  
  const statusData = data as Record<string, unknown>;
  
  // 모든 키가 올바른 형식인지 확인
  for (const [key, value] of Object.entries(statusData)) {
    const isValidKey = /^(product|post|comment)_/.test(key);
    if (!isValidKey || !isValidReactionStatusItem(value)) {
      return false;
    }
  }
  
  return true;
}
