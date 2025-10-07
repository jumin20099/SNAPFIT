const { test, expect } = require('@playwright/test');

test.describe('SnapFit 간단 테스트', () => {
  test('홈페이지 로딩', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle('SNAPFIT');
  });

  test('커뮤니티 페이지 접근', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=커뮤니티');
    await expect(page.locator('text=코디 공유')).toBeVisible();
  });

  test('기본 네비게이션', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=홈')).toBeVisible();
    await expect(page.locator('text=커뮤니티')).toBeVisible();
  });
});
