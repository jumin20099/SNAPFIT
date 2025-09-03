import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 환경 설정
  environment: process.env.NODE_ENV,
  
  // 샘플링 설정 (에러는 100%, 트랜잭션은 10%)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 에러 샘플링 설정
  sampleRate: 1.0,
  
  // 릴리스 설정
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // 사용자 정보 설정
  beforeSend(event) {
    // 민감한 정보 제거
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    
    // 개발 환경에서는 에러 로깅 비활성화
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    return event;
  },
  
  // 트랜잭션 필터링
  beforeSendTransaction(event) {
    // 정적 파일 요청 제외
    if (event.transaction?.includes('/_next/static/')) {
      return null;
    }
    
    return event;
  },
  
  // 통합 설정 (최신 Sentry 버전에서는 자동으로 설정됨)
  integrations: [
    // Next.js 통합은 자동으로 포함됨
  ],
  
  // 에러 필터링
  ignoreErrors: [
    // 브라우저 확장 프로그램 에러
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'Script error.',
    'Network request failed',
    
    // 개발 도구 에러
    'ChunkLoadError',
    'Loading chunk',
    
    // 외부 서비스 에러
    'Failed to fetch',
    'NetworkError',
  ],
  
  // 태그 설정
  initialScope: {
    tags: {
      component: 'frontend',
      platform: 'web',
    },
  },
});
