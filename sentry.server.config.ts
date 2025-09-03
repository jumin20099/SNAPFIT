import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 환경 설정
  environment: process.env.NODE_ENV,
  
  // 샘플링 설정
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 릴리스 설정
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // 서버 사이드 에러 필터링
  beforeSend(event) {
    // 개발 환경에서는 에러 로깅 비활성화
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // 민감한 정보 제거
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    
    return event;
  },
  
  // 통합 설정 (최신 Sentry 버전에서는 자동으로 설정됨)
  integrations: [
    // Next.js 통합은 자동으로 포함됨
  ],
  
  // 에러 필터링
  ignoreErrors: [
    // Next.js 관련 에러
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT',
    
    // 데이터베이스 연결 에러
    'Connection terminated unexpectedly',
    'Connection lost',
    
    // 외부 API 에러
    'Request failed with status code',
    'Network Error',
  ],
  
  // 태그 설정
  initialScope: {
    tags: {
      component: 'backend',
      platform: 'server',
    },
  },
});
