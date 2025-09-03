// 번들 분석 및 최적화를 위한 유틸리티

export interface BundleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  chunks: string[];
  modules: string[];
}

export interface BundleAnalysis {
  totalSize: number;
  totalGzippedSize: number;
  largestChunks: BundleInfo[];
  duplicateModules: string[];
  unusedModules: string[];
}

// 번들 크기 제한 설정
export const BUNDLE_LIMITS = {
  // 페이지별 최대 번들 크기 (gzipped)
  PAGE_MAX_SIZE: 100 * 1024, // 100KB
  // 컴포넌트별 최대 번들 크기 (gzipped)
  COMPONENT_MAX_SIZE: 50 * 1024, // 50KB
  // 전체 앱 최대 번들 크기 (gzipped)
  APP_MAX_SIZE: 500 * 1024, // 500KB
} as const;

// 번들 크기 검증 함수
export function validateBundleSize(
  bundleInfo: BundleInfo,
  limit: number = BUNDLE_LIMITS.COMPONENT_MAX_SIZE
): { isValid: boolean; message: string } {
  if (bundleInfo.gzippedSize > limit) {
    return {
      isValid: false,
      message: `번들 크기가 제한을 초과했습니다. 현재: ${formatBytes(bundleInfo.gzippedSize)}, 제한: ${formatBytes(limit)}`,
    };
  }
  
  return {
    isValid: true,
    message: `번들 크기가 적절합니다. 현재: ${formatBytes(bundleInfo.gzippedSize)}`,
  };
}

// 바이트를 읽기 쉬운 형태로 변환
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 번들 최적화 권장사항
export function getOptimizationRecommendations(bundleInfo: BundleInfo): string[] {
  const recommendations: string[] = [];
  
  if (bundleInfo.gzippedSize > BUNDLE_LIMITS.COMPONENT_MAX_SIZE) {
    recommendations.push('번들 크기가 큽니다. 코드 분할을 고려하세요.');
  }
  
  if (bundleInfo.modules.length > 50) {
    recommendations.push('모듈 수가 많습니다. 불필요한 의존성을 제거하세요.');
  }
  
  if (bundleInfo.chunks.length > 10) {
    recommendations.push('청크 수가 많습니다. 청크 병합을 고려하세요.');
  }
  
  return recommendations;
}

// 동적 임포트 최적화 가이드
export const DYNAMIC_IMPORT_GUIDE = {
  // 페이지 레벨 컴포넌트는 항상 동적 임포트
  pageComponents: [
    'ProductDetailPage',
    'CodySystem',
    'CommunityPage',
    'MyPage',
    'PartnerDashboard',
    'AdminPage',
  ],
  
  // 무거운 컴포넌트는 SSR 비활성화
  heavyComponents: [
    'ProductAnalytics',
    'CodyDisplayContainer',
    'SSETest',
  ],
  
  // 라이브러리별 동적 임포트
  libraries: {
    'framer-motion': '애니메이션이 필요한 컴포넌트에서만 사용',
    'react-dnd': '드래그 앤 드롭이 필요한 컴포넌트에서만 사용',
    '@tanstack/react-virtual': '대용량 리스트에서만 사용',
  },
};

// 프리로드 전략
export const PRELOAD_STRATEGY = {
  // 즉시 프리로드할 컴포넌트
  immediate: [
    'ProductCard',
    'CategoryTab',
    'HeaderNav',
  ],
  
  // 사용자 상호작용 후 프리로드할 컴포넌트
  onInteraction: [
    'ProductDetailPage',
    'CodySystem',
    'PostCreatePage',
  ],
  
  // 지연 프리로드할 컴포넌트
  delayed: [
    'AdminPage',
    'PartnerDashboard',
    'ProductAnalytics',
  ],
};
