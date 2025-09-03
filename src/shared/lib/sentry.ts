import * as Sentry from '@sentry/nextjs';

// Sentry 유틸리티 함수들

/**
 * 사용자 정보 설정
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * 사용자 정보 제거
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * 커스텀 태그 설정
 */
export function setSentryTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * 커스텀 컨텍스트 설정
 */
export function setSentryContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context);
}

/**
 * 커스텀 에러 캡처
 */
export function captureSentryError(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'error' | 'warning' | 'info' | 'debug';
  }
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    if (context?.level) {
      scope.setLevel(context.level);
    }
    
    Sentry.captureException(error);
  });
}

/**
 * 커스텀 메시지 캡처
 */
export function captureSentryMessage(
  message: string,
  level: 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
) {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    Sentry.captureMessage(message, level);
  });
}

/**
 * 성능 트랜잭션 시작 (Sentry v8에서는 startTransaction이 제거됨)
 */
export function startSentryTransaction(
  name: string,
  op: string,
  description?: string
) {
  // Sentry v8에서는 startTransaction이 제거되었으므로 span을 사용
  return Sentry.startSpan({
    name,
    op,
  }, () => {
    // 트랜잭션 로직
  });
}

/**
 * API 에러 캡처 헬퍼
 */
export function captureApiError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number
) {
  captureSentryError(error, {
    tags: {
      component: 'api',
      endpoint,
      method,
      statusCode: statusCode?.toString() || 'unknown',
    },
    extra: {
      url: endpoint,
      method,
      statusCode,
    },
  });
}

/**
 * 사용자 액션 추적
 */
export function trackUserAction(
  action: string,
  category: string,
  properties?: Record<string, any>
) {
  captureSentryMessage(`User Action: ${action}`, 'info', {
    tags: {
      action,
      category,
    },
    extra: properties,
  });
}

/**
 * 성능 메트릭 추적
 */
export function trackPerformanceMetric(
  metric: string,
  value: number,
  unit: string = 'ms'
) {
  captureSentryMessage(`Performance: ${metric}`, 'info', {
    tags: {
      metric,
      unit,
    },
    extra: {
      value,
    },
  });
}

/**
 * 비즈니스 로직 에러 캡처
 */
export function captureBusinessError(
  error: Error,
  businessContext: string,
  additionalInfo?: Record<string, any>
) {
  captureSentryError(error, {
    tags: {
      component: 'business-logic',
      context: businessContext,
    },
    extra: additionalInfo,
  });
}
