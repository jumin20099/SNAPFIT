import { test, expect, request } from '@playwright/test';

test.describe('Health & boot', () => {
  test('health endpoint passes through to backend products', async ({ baseURL }) => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${baseURL}/api/health`, { headers: { 'cache-control': 'no-store' } });
    // 200 { ok: true } or 503 with reason
    expect([200, 503]).toContain(res.status());
    const body = await res.json().catch(() => ({}));
    if (res.status() === 200) expect(body.ok).toBeTruthy();
  });
});
