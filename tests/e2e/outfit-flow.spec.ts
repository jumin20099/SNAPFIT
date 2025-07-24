import { test, expect } from '@playwright/test';

test('category to product list flow', async ({ page }) => {
  await page.goto('/');
  // click tops major
  await page.getByRole('button', { name: '상의' }).click();
  // optional sub select skip
  // expect product cards visible
  await expect(page.locator('img[alt="상품"]')).toBeVisible({ timeout: 10000 });
}); 