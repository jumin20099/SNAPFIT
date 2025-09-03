// Lighthouse CI 설정 및 성능 예산

export interface LighthouseBudget {
  resourceSizes: Array<{
    resourceType: string;
    budget: number;
  }>;
  resourceCounts: Array<{
    resourceType: string;
    budget: number;
  }>;
  timings: Array<{
    metric: string;
    budget: number;
  }>;
}

// Lighthouse CI 성능 예산 설정
export const LIGHTHOUSE_BUDGET: LighthouseBudget = {
  resourceSizes: [
    {
      resourceType: 'script',
      budget: 500 * 1024, // 500KB
    },
    {
      resourceType: 'total',
      budget: 1000 * 1024, // 1MB
    },
    {
      resourceType: 'stylesheet',
      budget: 100 * 1024, // 100KB
    },
    {
      resourceType: 'image',
      budget: 2000 * 1024, // 2MB
    },
  ],
  resourceCounts: [
    {
      resourceType: 'script',
      budget: 20,
    },
    {
      resourceType: 'stylesheet',
      budget: 5,
    },
    {
      resourceType: 'image',
      budget: 50,
    },
  ],
  timings: [
    {
      metric: 'first-contentful-paint',
      budget: 1800, // 1.8초
    },
    {
      metric: 'largest-contentful-paint',
      budget: 2500, // 2.5초
    },
    {
      metric: 'cumulative-layout-shift',
      budget: 0.1,
    },
    {
      metric: 'speed-index',
      budget: 3000, // 3초
    },
    {
      metric: 'interactive',
      budget: 4000, // 4초
    },
  ],
};

// Lighthouse CI 설정 파일 생성
export function generateLighthouseConfig() {
  return {
    ci: {
      collect: {
        url: ['http://localhost:3000'],
        startServerCommand: 'npm run start',
        startServerReadyPattern: 'ready on',
        startServerReadyTimeout: 30000,
      },
      assert: {
        assertions: {
          'categories:performance': ['error', { minScore: 0.9 }],
          'categories:accessibility': ['error', { minScore: 0.9 }],
          'categories:best-practices': ['error', { minScore: 0.9 }],
          'categories:seo': ['error', { minScore: 0.9 }],
          'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
          'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
          'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
          'speed-index': ['error', { maxNumericValue: 3000 }],
          'interactive': ['error', { maxNumericValue: 4000 }],
        },
        budgets: [LIGHTHOUSE_BUDGET],
      },
      upload: {
        target: 'temporary-public-storage',
      },
    },
  };
}

// 성능 예산 검증 함수
export function validatePerformanceBudget(metrics: any): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  // 리소스 크기 검증
  LIGHTHOUSE_BUDGET.resourceSizes.forEach(({ resourceType, budget }) => {
    const actualSize = metrics.audits[`resource-summary`]?.details?.items
      ?.find((item: any) => item.resourceType === resourceType)?.size;
    
    if (actualSize && actualSize > budget) {
      violations.push(
        `${resourceType} 크기가 예산을 초과했습니다. 예산: ${budget}bytes, 실제: ${actualSize}bytes`
      );
    }
  });

  // 타이밍 검증
  LIGHTHOUSE_BUDGET.timings.forEach(({ metric, budget }) => {
    const actualValue = metrics.audits[metric]?.numericValue;
    
    if (actualValue && actualValue > budget) {
      violations.push(
        `${metric}이 예산을 초과했습니다. 예산: ${budget}ms, 실제: ${actualValue}ms`
      );
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
}

// 성능 리포트 생성
export function generatePerformanceReport(metrics: any): string {
  const validation = validatePerformanceBudget(metrics);
  
  let report = '=== 성능 리포트 ===\n\n';
  
  // Core Web Vitals
  report += 'Core Web Vitals:\n';
  report += `- First Contentful Paint: ${metrics.audits['first-contentful-paint']?.displayValue || 'N/A'}\n`;
  report += `- Largest Contentful Paint: ${metrics.audits['largest-contentful-paint']?.displayValue || 'N/A'}\n`;
  report += `- Cumulative Layout Shift: ${metrics.audits['cumulative-layout-shift']?.displayValue || 'N/A'}\n`;
  report += `- Speed Index: ${metrics.audits['speed-index']?.displayValue || 'N/A'}\n`;
  report += `- Time to Interactive: ${metrics.audits['interactive']?.displayValue || 'N/A'}\n\n`;
  
  // 성능 점수
  report += `성능 점수: ${metrics.categories.performance.score * 100}/100\n\n`;
  
  // 예산 검증 결과
  if (validation.passed) {
    report += '✅ 모든 성능 예산을 만족합니다.\n';
  } else {
    report += '❌ 성능 예산 위반:\n';
    validation.violations.forEach(violation => {
      report += `  - ${violation}\n`;
    });
  }
  
  return report;
}
