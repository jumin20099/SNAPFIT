import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 환경 설정
  environment: process.env.NODE_ENV,
  
  // 샘플링 설정
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 릴리스 설정
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Edge Runtime 에러 필터링
  beforeSend(event) {
    // 개발 환경에서는 에러 로깅 비활성화
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    return event;
  },
  
  // 에러 필터링
  ignoreErrors: [
    // Edge Runtime 관련 에러
    'EdgeRuntime',
    'EdgeFunction',
    
    // 네트워크 에러
    'NetworkError',
    'FetchError',
  ],
  
  // 태그 설정
  initialScope: {
    tags: {
      component: 'edge',
      platform: 'edge',
    },
  },
});
