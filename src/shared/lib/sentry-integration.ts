import { captureSentryError, setSentryUser, clearSentryUser, setSentryTag } from './sentry';
import { trackApiError, trackUserInteractionError } from './error-tracking';

// Sentry 통합 유틸리티

/**
 * TanStack Query 에러 통합
 * React Query v5에서는 onError 옵션이 제거되었으므로 별도 에러 핸들링 필요
 */
export function integrateWithTanStackQuery() {
  // React Query v5에서는 useQuery의 onError 콜백을 사용하거나
  // QueryClient의 mutationCache/queryCache를 통해 에러를 처리해야 함
  console.log('TanStack Query integration - onError 옵션은 v5에서 제거됨');
}

/**
 * React Router 에러 통합
 */
export function integrateWithReactRouter() {
  if (typeof window !== 'undefined') {
    // 라우트 변경 시 컨텍스트 업데이트
    window.addEventListener('popstate', () => {
      setSentryTag('route', window.location.pathname);
    });
  }
}

/**
 * 사용자 인증 통합
 */
export function integrateWithAuth() {
  // 로그인 시 사용자 정보 설정
  const handleLogin = (user: any) => {
    setSentryUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  };

  // 로그아웃 시 사용자 정보 제거
  const handleLogout = () => {
    clearSentryUser();
  };

  return { handleLogin, handleLogout };
}

/**
 * 성능 모니터링 통합
 */
export function integrateWithPerformanceMonitoring() {
  // web-vitals 패키지가 설치되지 않았으므로 성능 모니터링 비활성화
  console.log('성능 모니터링 - web-vitals 패키지가 설치되지 않음');
}

/**
 * 전역 에러 핸들러 통합
 */
export function integrateWithGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
      captureSentryError(event.error, {
        tags: {
          component: 'global-error',
        },
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Promise rejection 핸들러
    window.addEventListener('unhandledrejection', (event) => {
      captureSentryError(new Error(event.reason), {
        tags: {
          component: 'unhandled-promise-rejection',
        },
        extra: {
          reason: event.reason,
        },
      });
    });
  }
}

/**
 * 모든 통합 초기화
 */
export function initializeSentryIntegrations() {
  integrateWithTanStackQuery();
  integrateWithReactRouter();
  integrateWithPerformanceMonitoring();
  integrateWithGlobalErrorHandlers();
}
