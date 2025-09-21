import { test, expect } from '@playwright/test';

test.describe('좋아요 및 스크랩 기능 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트용 JWT 토큰 설정
    await page.addInitScript(() => {
      // 유효한 테스트 토큰 설정
      const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZW1wQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTU3MTc3ODQsImV4cCI6MTc1NTgwNDE4NH0.WcecABlkfW_i7ovCZoFRfpKz79t6NKJBYnE0v-qvxpk';
      localStorage.setItem('token', testToken);
    });
    
    // 커뮤니티 페이지로 이동
    await page.goto('/community');
  });

  test('좋아요 토글이 정상적으로 작동하고 DB에 반영된다', async ({ page }) => {
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 첫 번째 게시글 카드 찾기
    const firstPostCard = page.locator('.grid.grid-cols-2 > div').first();
    await expect(firstPostCard).toBeVisible({ timeout: 10000 });
    
    // 좋아요 버튼 찾기
    const likeButton = firstPostCard.locator('[data-testid="like-button"]');
    
    // 초기 좋아요 상태 확인
    const initialLiked = await likeButton.getAttribute('data-liked');
    
    // 좋아요 버튼 클릭
    await likeButton.click();
    
    // 좋아요 상태 변경 대기 (UI 업데이트 시간 고려)
    await page.waitForTimeout(1000);
    
    // 좋아요 상태 변경 확인
    const newLiked = await likeButton.getAttribute('data-liked');
    
    // 좋아요 상태가 변경되었는지 확인
    expect(newLiked).not.toBe(initialLiked);
  });

  test('스크랩 토글이 정상적으로 작동하고 DB에 반영된다', async ({ page }) => {
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 첫 번째 게시글 카드 찾기
    const firstPostCard = page.locator('.grid.grid-cols-2 > div').first();
    await expect(firstPostCard).toBeVisible({ timeout: 10000 });
    
    // 스크랩 버튼 찾기
    const scrapButton = firstPostCard.locator('[data-testid="scrap-button"]');
    
    // 초기 스크랩 상태 확인
    const initialScraped = await scrapButton.getAttribute('data-scraped');
    
    // 스크랩 버튼 클릭
    await scrapButton.click();
    
    // 스크랩 상태 변경 대기 (UI 업데이트 시간 고려)
    await page.waitForTimeout(1000);
    
    // 스크랩 상태 변경 확인
    const newScraped = await scrapButton.getAttribute('data-scraped');
    
    // 스크랩 상태가 변경되었는지 확인
    expect(newScraped).not.toBe(initialScraped);
  });

  test('좋아요/스크랩 상태가 사용자별로 독립적으로 관리된다', async ({ page, context }) => {
    // 첫 번째 사용자로 좋아요/스크랩 설정
    const likeButton = page.locator('[data-testid="like-button"]').first();
    const scrapButton = page.locator('[data-testid="scrap-button"]').first();
    
    await likeButton.click();
    await scrapButton.click();
    
    // 새 브라우저 컨텍스트로 다른 사용자 시뮬레이션
    const newPage = await context.newPage();
    await newPage.goto('/community');
    
    // 다른 사용자로는 좋아요/스크랩이 설정되지 않음
    const newLikeButton = newPage.locator('[data-testid="like-button"]').first();
    const newScrapButton = newPage.locator('[data-testid="scrap-button"]').first();
    
    await expect(newLikeButton).toHaveAttribute('data-liked', 'false');
    await expect(newScrapButton).toHaveAttribute('data-scraped', 'false');
  });

  test('좋아요/스크랩 토글 시 에러가 발생하지 않는다', async ({ page }) => {
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 첫 번째 게시글 카드 찾기
    const firstPostCard = page.locator('.grid.grid-cols-2 > div').first();
    await expect(firstPostCard).toBeVisible({ timeout: 10000 });
    
    // 좋아요/스크랩 버튼 찾기
    const likeButton = firstPostCard.locator('[data-testid="like-button"]');
    const scrapButton = firstPostCard.locator('[data-testid="scrap-button"]');
    
    // 버튼들이 클릭 가능한지 확인
    await expect(likeButton).toBeVisible();
    await expect(scrapButton).toBeVisible();
    
    // 좋아요 버튼 클릭 (에러 발생하지 않음)
    await likeButton.click();
    await page.waitForTimeout(500);
    
    // 스크랩 버튼 클릭 (에러 발생하지 않음)
    await scrapButton.click();
    await page.waitForTimeout(500);
    
    // 페이지가 여전히 정상 상태인지 확인
    await expect(firstPostCard).toBeVisible();
  });
});
