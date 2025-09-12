import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// 에러 컴포넌트
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <p className="text-red-500 mb-2">컴포넌트를 불러오는 중 오류가 발생했습니다.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        다시 시도
      </button>
    </div>
  </div>
);

// 동적 임포트 헬퍼 함수
export function createDynamicImport<T = any>(
  importFn: () => Promise<any>,
  options?: {
    loading?: () => React.ReactElement;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || LoadingSpinner,
    ssr: options?.ssr ?? true,
  });
}

// 페이지별 동적 임포트 (실제 존재하는 컴포넌트만)
export const DynamicPages = {
  // 메인 페이지
  HomePage: createDynamicImport(() => import('@/components/home-page').then(mod => ({ default: mod.HomePage }))),
  
  // 상품 관련 페이지
  ProductGrid: createDynamicImport(() => import('@/widgets/product-grid/product-grid').then(mod => ({ default: mod.ProductGrid }))),
  
  // 코디 관련 페이지
  // CodySystem: createDynamicImport(() => import('@/components/cody-system').then(mod => ({ default: mod.default }))),
  CodyPlayground: createDynamicImport(() => import('@/components/cody-playground').then(mod => ({ default: mod.CodyPlayground }))),
  
  // 사용자 관련 페이지는 제거됨
};

// 위젯별 동적 임포트
export const DynamicWidgets = {
  // 가상화된 상품 그리드
  VirtualizedProductGrid: createDynamicImport(() => import('@/widgets/product-grid/VirtualizedProductGrid')),
  
  // 헤더 네비게이션
  HeaderNav: createDynamicImport(() => import('@/widgets/header-nav/HeaderNav')),
};

// 기능별 동적 임포트 (실제 존재하는 컴포넌트만)
export const DynamicFeatures = {
  // 상품 검색
  ProductSearchContainer: createDynamicImport(() => import('@/features/product-search/ProductSearchContainer')),
  
  // 코디 빌더
  CodyBuilderContainer: createDynamicImport(() => import('@/features/cody-builder/CodyBuilderContainer')),
  

};

// 무거운 컴포넌트들 (SSR 비활성화) - 현재 사용되지 않음
export const HeavyComponents = {
  // 향후 무거운 컴포넌트들을 여기에 추가
};
