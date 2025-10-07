const { test, expect } = require('@playwright/test');

test('SnapFit 기본 테스트', async ({ page }) => {
  // 홈페이지 로딩 테스트
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('domcontentloaded');
  
  // 기본 요소 확인
  await expect(page.locator('text=SNAPFIT')).toBeVisible();
  await expect(page.locator('text=홈')).toBeVisible();
  await expect(page.locator('text=커뮤니티')).toBeVisible();
  
  console.log('✅ 기본 페이지 로딩 성공');
});

test('커뮤니티 페이지 접근', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=커뮤니티');
  await page.waitForLoadState('domcontentloaded');
  
  // 커뮤니티 탭 확인
  await expect(page.locator('text=코디 공유')).toBeVisible();
  
  console.log('✅ 커뮤니티 페이지 접근 성공');
});
