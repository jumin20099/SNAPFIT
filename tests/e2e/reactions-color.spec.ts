import { test, expect } from '@playwright/test';

test.describe('좋아요/스크랩 버튼 색상 상태 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트용 JWT 토큰 설정
    await page.addInitScript(() => {
      const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZW1wQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTU3MTc3ODQsImV4cCI6MTc1NTgwNDE4NH0.WcecABlkfW_i7ovCZoFRfpKz79t6NKJBYnE0v-qvxpk';
      localStorage.setItem('token', testToken);
    });
    
    // 커뮤니티 페이지로 이동
    await page.goto('/community');
  });

  test('좋아요 버튼이 상태에 따라 색상이 변경된다', async ({ page }) => {
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 첫 번째 게시글 카드 찾기
    const firstPostCard = page.locator('.grid.grid-cols-2 > div').first();
    await expect(firstPostCard).toBeVisible({ timeout: 10000 });
    
    // 좋아요 버튼 찾기
    const likeButton = firstPostCard.locator('[data-testid="like-button"]');
    await expect(likeButton).toBeVisible();
    
    // 초기 상태 확인 (비활성 상태)
    const initialClass = await likeButton.getAttribute('class');
    expect(initialClass).toContain('text-gray-400');
    
    // 좋아요 버튼 클릭
    await likeButton.click();
    
    // 색상 변경 대기
    await page.waitForTimeout(1000);
    
    // 활성 상태 확인 (rose 색상)
    const activeClass = await likeButton.getAttribute('class');
    expect(activeClass).toContain('text-rose-500');
    expect(activeClass).toContain('fill-rose-500');
    
    // aria-pressed 속성 확인
    await expect(likeButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('스크랩 버튼이 상태에 따라 색상이 변경된다', async ({ page }) => {
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 첫 번째 게시글 카드 찾기
    const firstPostCard = page.locator('.grid.grid-cols-2 > div').first();
    await expect(firstPostCard).toBeVisible({ timeout: 10000 });
    
    // 스크랩 버튼 찾기
    const scrapButton = firstPostCard.locator('[data-testid="scrap-button"]');
    await expect(scrapButton).toBeVisible();
    
    // 초기 상태 확인 (비활성 상태)
    const initialClass = await scrapButton.getAttribute('class');
    expect(initialClass).toContain('text-gray-400');
    
    // 스크랩 버튼 클릭
    await scrapButton.click();
    
    // 색상 변경 대기
    await page.waitForTimeout(1000);
    
    // 활성 상태 확인 (amber 색상)
    const activeClass = await scrapButton.getAttribute('class');
    expect(activeClass).toContain('text-amber-500');
    expect(activeClass).toContain('fill-amber-500');
    
    // aria-pressed 속성 확인
    await expect(scrapButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('버튼 클릭 시 카운트가 변경된다', async ({ page }) => {
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 첫 번째 게시글 카드 찾기
    const firstPostCard = page.locator('.grid.grid-cols-2 > div').first();
    await expect(firstPostCard).toBeVisible({ timeout: 10000 });
    
    // 좋아요 버튼과 카운트 찾기
    const likeButton = firstPostCard.locator('[data-testid="like-button"]');
    const likeCount = firstPostCard.locator('[data-testid="like-count"]');
    
    // 초기 카운트 확인
    const initialCount = await likeCount.textContent();
    const initialCountNum = parseInt(initialCount || '0');
    
    // 좋아요 버튼 클릭
    await likeButton.click();
    
    // 카운트 변경 대기
    await page.waitForTimeout(1000);
    
    // 카운트 변경 확인
    const newCount = await likeCount.textContent();
    const newCountNum = parseInt(newCount || '0');
    
    // 카운트가 변경되었는지 확인 (증가 또는 감소)
    expect(newCountNum).not.toBe(initialCountNum);
  });
});
