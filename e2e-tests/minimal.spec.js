const { test, expect } = require('@playwright/test');

test('SnapFit 최소 테스트', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('domcontentloaded');
  
  // 제목 확인
  const title = await page.title();
  console.log('페이지 제목:', title);
  
  // 기본 요소 확인
  const homeText = await page.locator('text=홈').isVisible();
  const communityText = await page.locator('text=커뮤니티').isVisible();
  
  console.log('홈 텍스트 보임:', homeText);
  console.log('커뮤니티 텍스트 보임:', communityText);
  
  // 최소한의 검증
  expect(title).toContain('SNAPFIT');
  expect(homeText).toBe(true);
  expect(communityText).toBe(true);
});
