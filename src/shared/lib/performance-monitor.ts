// 성능 모니터링 유틸리티
import React from 'react';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  
  // 사용자 정의 메트릭
  pageLoadTime: number;
  apiResponseTime: number;
  imageLoadTime: number;
  bundleSize: number;
}

export interface PerformanceThresholds {
  lcp: number; // 2.5초
  fid: number; // 100ms
  cls: number; // 0.1
  fcp: number; // 1.8초
  ttfb: number; // 600ms
  pageLoadTime: number; // 3초
  apiResponseTime: number; // 1초
  imageLoadTime: number; // 2초
  bundleSize: number; // 500KB
}

// 성능 임계값 설정
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  fcp: 1800,
  ttfb: 600,
  pageLoadTime: 3000,
  apiResponseTime: 1000,
  imageLoadTime: 2000,
  bundleSize: 500 * 1024, // 500KB
};

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // LCP (Largest Contentful Paint) 측정
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.checkThreshold('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // FID (First Input Delay) 측정
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.checkThreshold('fid', this.metrics.fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // CLS (Cumulative Layout Shift) 측정
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.checkThreshold('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // FCP (First Contentful Paint) 측정
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.checkThreshold('fcp', entry.startTime);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    }

    // 페이지 로드 시간 측정
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.checkThreshold('pageLoadTime', this.metrics.pageLoadTime);
    });
  }

  private checkThreshold(metric: keyof PerformanceThresholds, value: number) {
    const threshold = PERFORMANCE_THRESHOLDS[metric];
    if (value > threshold) {
      console.warn(`성능 경고: ${metric}이 임계값을 초과했습니다. 현재: ${value}ms, 임계값: ${threshold}ms`);
      this.reportPerformanceIssue(metric, value, threshold);
    }
  }

  private reportPerformanceIssue(metric: string, value: number, threshold: number) {
    // 성능 이슈를 서버에 보고 (실제 구현에서는 API 호출)
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/performance-issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric,
          value,
          threshold,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(console.error);
    }
  }

  // API 응답 시간 측정
  measureApiResponse(url: string, startTime: number, endTime: number) {
    const responseTime = endTime - startTime;
    this.metrics.apiResponseTime = responseTime;
    this.checkThreshold('apiResponseTime', responseTime);
    
    if (responseTime > PERFORMANCE_THRESHOLDS.apiResponseTime) {
      console.warn(`API 응답 시간 경고: ${url} - ${responseTime}ms`);
    }
  }

  // 이미지 로딩 시간 측정
  measureImageLoad(imageUrl: string, startTime: number, endTime: number) {
    const loadTime = endTime - startTime;
    this.metrics.imageLoadTime = loadTime;
    this.checkThreshold('imageLoadTime', loadTime);
    
    if (loadTime > PERFORMANCE_THRESHOLDS.imageLoadTime) {
      console.warn(`이미지 로딩 시간 경고: ${imageUrl} - ${loadTime}ms`);
    }
  }

  // 번들 크기 측정
  measureBundleSize(size: number) {
    this.metrics.bundleSize = size;
    this.checkThreshold('bundleSize', size);
  }

  // 현재 메트릭 가져오기
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // 성능 리포트 생성
  generateReport(): string {
    const metrics = this.getMetrics();
    const report = Object.entries(metrics)
      .map(([key, value]) => `${key}: ${value}ms`)
      .join('\n');
    
    return `성능 리포트:\n${report}`;
  }

  // 정리
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// 전역 성능 모니터 인스턴스
export const performanceMonitor = new PerformanceMonitor();

// React Hook for Performance Monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<Partial<PerformanceMetrics>>({});

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
    };

    // 주기적으로 메트릭 업데이트
    const interval = setInterval(updateMetrics, 5000);
    
    // 페이지 로드 완료 시 메트릭 업데이트
    window.addEventListener('load', updateMetrics);

    return () => {
      clearInterval(interval);
      window.removeEventListener('load', updateMetrics);
    };
  }, []);

  return metrics;
}
