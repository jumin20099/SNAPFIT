// Product 타입은 @/shared/types에서 import
import type { Product } from '@/shared/types'
export type { Product }

// 상품 관련 추가 타입들
export interface ProductCategory {
  major: string;
  sub?: string;
}

export interface ProductSearchParams {
  keyword?: string;
  type?: 'all' | 'product' | 'category';
  major?: string;
  sub?: string;
  page?: number;
  size?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'likeCount';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  categories?: string[];
  brands?: string[];
  tags?: string[];
}

// 상품 관련 비즈니스 로직
export const ProductUtils = {
  formatPrice: (price: number): string => {
    return `₩${price.toLocaleString()}`;
  },

  getImageUrl: (imagePath: string): string => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${process.env.NEXT_PUBLIC_CDN_URL || ''}${imagePath}`;
  },

  isOnSale: (product: Product): boolean => {
    // 할인 로직 구현
    return false;
  },

  getDiscountPrice: (product: Product): number | null => {
    // 할인가 계산 로직
    return null;
  },
};