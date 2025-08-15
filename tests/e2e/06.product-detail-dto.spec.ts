import { test, expect, request } from '@playwright/test';

/**
 * 상세 DTO 스키마(백엔드 ProductDetailDto) 필수 필드 검증
 */
test('product detail dto has expected fields', async ({ baseURL }) => {
  const ctx = await request.newContext();
  const res = await ctx.get(`${baseURL}/api/products/1`);
  expect([200, 404]).toContain(res.status());
  if (res.status() === 200) {
    const dto = await res.json();
    for (const k of ['product', 'viewCount', 'actualViewCount', 'likesCount', 'likedByUser', 'liveViewers']) {
      expect(dto).toHaveProperty(k);
    }
    expect(dto.product).toHaveProperty('productIdx');
    expect(dto.product).toHaveProperty('productName');
  }
});
