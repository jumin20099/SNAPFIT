import { test, expect } from '@playwright/test';

test.describe('성능 테스트', () => {
  test('페이지 로딩 성능이 기준을 만족해야 한다', async ({ page }) => {
    // 성능 메트릭 수집 시작
    await page.goto('/', { waitUntil: 'networkidle' });

    // Lighthouse 성능 메트릭 확인
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              metrics['loadTime'] = entry.loadEventEnd - entry.loadEventStart;
              metrics['domContentLoaded'] = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
            }
            
            if (entry.entryType === 'paint') {
              metrics[entry.name] = entry.startTime;
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['navigation', 'paint'] });
      });
    });

    // LCP (Largest Contentful Paint) 확인
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    // 성능 기준 확인
    expect(lcp).toBeLessThan(2500); // LCP < 2.5초
  });

  test('이미지 로딩이 최적화되어야 한다', async ({ page }) => {
    await page.goto('/');

    // 이미지 로딩 상태 확인
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      
      // 이미지가 로드되었는지 확인
      await expect(img).toHaveJSProperty('complete', true);
      
      // 이미지가 Next.js Image 컴포넌트인지 확인
      const isNextImage = await img.evaluate((el) => {
        return el.tagName === 'IMG' && el.hasAttribute('data-nimg');
      });
      
      expect(isNextImage).toBe(true);
    }
  });

  test('번들 크기가 최적화되어야 한다', async ({ page }) => {
    // 네트워크 요청 모니터링
    const requests = [];
    
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        resourceType: request.resourceType(),
        size: request.headers()['content-length'] || 0,
      });
    });

    await page.goto('/');

    // JavaScript 번들 크기 확인
    const jsRequests = requests.filter(req => 
      req.resourceType === 'script' && 
      req.url.includes('/_next/static/')
    );

    const totalJSSize = jsRequests.reduce((total, req) => total + parseInt(req.size), 0);
    
    // JavaScript 번들 크기가 500KB 이하여야 함
    expect(totalJSSize).toBeLessThan(500 * 1024);
  });

  test('메모리 사용량이 안정적이어야 한다', async ({ page }) => {
    await page.goto('/');

    // 메모리 사용량 측정
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });

    if (memoryUsage) {
      // 힙 사용량이 50MB 이하여야 함
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('가상화된 리스트가 성능을 개선해야 한다', async ({ page }) => {
    await page.goto('/');

    // 대량의 상품 데이터 로딩
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toBeVisible();

    // 스크롤 성능 측정
    const scrollStartTime = Date.now();
    
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(1000);
    
    const scrollEndTime = Date.now();
    const scrollDuration = scrollEndTime - scrollStartTime;

    // 스크롤이 1초 이내에 완료되어야 함
    expect(scrollDuration).toBeLessThan(1000);

    // DOM 노드 수가 제한되어야 함 (가상화 확인)
    const domNodeCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });

    // DOM 노드 수가 1000개 이하여야 함
    expect(domNodeCount).toBeLessThan(1000);
  });

  test('캐싱이 올바르게 작동해야 한다', async ({ page }) => {
    // 첫 번째 방문
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 두 번째 방문 (캐시 확인)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 네트워크 요청이 캐시에서 제공되는지 확인
    const cachedRequests = [];
    
    page.on('response', (response) => {
      if (response.status() === 304) { // Not Modified
        cachedRequests.push(response.url());
      }
    });

    await page.reload();

    // 일부 요청이 캐시에서 제공되어야 함
    expect(cachedRequests.length).toBeGreaterThan(0);
  });
});
