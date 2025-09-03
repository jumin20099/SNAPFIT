import { captureSentryError, captureApiError } from './sentry';

// 에러 추적 유틸리티

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  additionalInfo?: Record<string, any>;
}

/**
 * React 에러 바운더리용 에러 추적
 */
export function trackReactError(
  error: Error,
  errorInfo: { componentStack: string },
  context?: ErrorContext
) {
  captureSentryError(error, {
    tags: {
      component: 'react-error-boundary',
      action: context?.action || 'unknown',
      userId: context?.userId || 'anonymous',
      sessionId: context?.sessionId || 'unknown',
    },
    extra: {
      componentStack: errorInfo.componentStack,
      ...context?.additionalInfo,
    },
  });
}

/**
 * API 에러 추적
 */
export function trackApiError(
  error: Error,
  request: {
    url: string;
    method: string;
    statusCode?: number;
    responseTime?: number;
  },
  context?: ErrorContext
) {
  captureApiError(error, request.url, request.method, request.statusCode);
  
  // 추가 컨텍스트 정보가 있으면 별도로 추적
  if (context) {
    captureSentryError(error, {
      tags: {
        component: 'api',
        action: context.action || 'unknown',
        userId: context.userId || 'anonymous',
        sessionId: context.sessionId || 'unknown',
      },
      extra: {
        request,
        ...context.additionalInfo,
      },
    });
  }
}

/**
 * 사용자 인터랙션 에러 추적
 */
export function trackUserInteractionError(
  error: Error,
  interaction: {
    type: string;
    element: string;
    page: string;
  },
  context?: ErrorContext
) {
  captureSentryError(error, {
    tags: {
      component: 'user-interaction',
      interactionType: interaction.type,
      page: interaction.page,
      action: context?.action || 'unknown',
      userId: context?.userId || 'anonymous',
      sessionId: context?.sessionId || 'unknown',
    },
    extra: {
      interaction,
      ...context?.additionalInfo,
    },
  });
}

/**
 * 성능 관련 에러 추적
 */
export function trackPerformanceError(
  error: Error,
  performanceContext: {
    metric: string;
    value: number;
    threshold: number;
  },
  context?: ErrorContext
) {
  captureSentryError(error, {
    tags: {
      component: 'performance',
      metric: performanceContext.metric,
      action: context?.action || 'unknown',
      userId: context?.userId || 'anonymous',
      sessionId: context?.sessionId || 'unknown',
    },
    extra: {
      performance: performanceContext,
      ...context?.additionalInfo,
    },
  });
}

/**
 * 비즈니스 로직 에러 추적
 */
export function trackBusinessLogicError(
  error: Error,
  businessContext: {
    feature: string;
    operation: string;
    data?: any;
  },
  context?: ErrorContext
) {
  captureSentryError(error, {
    tags: {
      component: 'business-logic',
      feature: businessContext.feature,
      operation: businessContext.operation,
      action: context?.action || 'unknown',
      userId: context?.userId || 'anonymous',
      sessionId: context?.sessionId || 'unknown',
    },
    extra: {
      businessContext,
      ...context?.additionalInfo,
    },
  });
}

/**
 * 외부 서비스 에러 추적
 */
export function trackExternalServiceError(
  error: Error,
  service: {
    name: string;
    endpoint: string;
    operation: string;
  },
  context?: ErrorContext
) {
  captureSentryError(error, {
    tags: {
      component: 'external-service',
      service: service.name,
      operation: service.operation,
      action: context?.action || 'unknown',
      userId: context?.userId || 'anonymous',
      sessionId: context?.sessionId || 'unknown',
    },
    extra: {
      service,
      ...context?.additionalInfo,
    },
  });
}

/**
 * 데이터베이스 에러 추적
 */
export function trackDatabaseError(
  error: Error,
  dbContext: {
    operation: string;
    table?: string;
    query?: string;
  },
  context?: ErrorContext
) {
  captureSentryError(error, {
    tags: {
      component: 'database',
      operation: dbContext.operation,
      table: dbContext.table || 'unknown',
      action: context?.action || 'unknown',
      userId: context?.userId || 'anonymous',
      sessionId: context?.sessionId || 'unknown',
    },
    extra: {
      dbContext,
      ...context?.additionalInfo,
    },
  });
}

/**
 * 인증/권한 에러 추적
 */
export function trackAuthError(
  error: Error,
  authContext: {
    operation: string;
    userId?: string;
    role?: string;
  },
  context?: ErrorContext
) {
  captureSentryError(error, {
    tags: {
      component: 'authentication',
      operation: authContext.operation,
      userId: authContext.userId || 'anonymous',
      role: authContext.role || 'unknown',
      action: context?.action || 'unknown',
      sessionId: context?.sessionId || 'unknown',
    },
    extra: {
      authContext,
      ...context?.additionalInfo,
    },
  });
}

/**
 * 파일 업로드 에러 추적
 */
export function trackFileUploadError(
  error: Error,
  uploadContext: {
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadType: string;
  },
  context?: ErrorContext
) {
  captureSentryError(error, {
    tags: {
      component: 'file-upload',
      uploadType: uploadContext.uploadType,
      fileType: uploadContext.fileType,
      action: context?.action || 'unknown',
      userId: context?.userId || 'anonymous',
      sessionId: context?.sessionId || 'unknown',
    },
    extra: {
      uploadContext,
      ...context?.additionalInfo,
    },
  });
}
