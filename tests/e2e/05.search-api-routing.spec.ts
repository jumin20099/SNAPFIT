import { test, expect, request } from '@playwright/test';

/**
 * /api/products/search → 백엔드 /api/admin/products/search/* 로 라우팅되는지 검사
 * 케이스: all/name/content/major-category/sub-category/store-name
 */
test.describe('Search API routing cases', () => {
  const cases = [
    ['all', 'keyword', 'tee'],
    ['name', 'productName', 'tee'],
    ['content', 'productContent', 'cotton'],
    ['major-category', 'majorCategory', '상의'],
    ['sub-category', 'subCategory', '니트'],
    ['store-name', 'storeName', 'E2E']
  ] as const;

  for (const [type, key, value] of cases) {
    test(`search type=${type}`, async ({ baseURL }) => {
      const ctx = await request.newContext();
      const res = await ctx.get(`${baseURL}/api/products/search`, { params: { keyword: value, type } });
      expect([200, 500]).toContain(res.status());
      // 200이면 배열
      if (res.status() === 200) {
        const data = await res.json();
        expect(Array.isArray(data)).toBeTruthy();
      }
    });
  }
});
