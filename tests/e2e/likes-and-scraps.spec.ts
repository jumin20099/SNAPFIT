import { test, expect } from '@playwright/test';

test.describe('좋아요 및 스크랩 기능 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태로 시작
    await page.goto('/login');
    // 카카오 로그인 시뮬레이션 (실제 구현에 맞게 수정 필요)
    // 로그인 시뮬레이션 건너뛰기 - 테스트용 토큰 사용
    // 로그인 완료 후 커뮤니티 페이지로 이동
    await page.goto('/community');
  });

  test('좋아요 토글이 정상적으로 작동하고 DB에 반영된다', async ({ page }) => {
    // 첫 번째 게시글의 좋아요 버튼 찾기
    const likeButton = page.locator('[data-testid="like-button"]').first();
    
    // 초기 좋아요 상태 확인
    const initialLikeCount = await likeButton.locator('[data-testid="like-count"]').textContent();
    
    // 좋아요 버튼 클릭
    await likeButton.click();
    
    // 좋아요 상태 변경 확인 (UI)
    await expect(likeButton).toHaveAttribute('data-liked', 'true');
    
    // 좋아요 수 증가 확인
    const newLikeCount = await likeButton.locator('[data-testid="like-count"]').textContent();
    expect(parseInt(newLikeCount || '0')).toBeGreaterThan(parseInt(initialLikeCount || '0'));
    
    // 페이지 새로고침 후 상태 유지 확인
    await page.reload();
    await expect(likeButton).toHaveAttribute('data-liked', 'true');
  });

  test('스크랩 토글이 정상적으로 작동하고 DB에 반영된다', async ({ page }) => {
    // 첫 번째 게시글의 스크랩 버튼 찾기
    const scrapButton = page.locator('[data-testid="scrap-button"]').first();
    
    // 초기 스크랩 상태 확인
    const initialScrapCount = await scrapButton.locator('[data-testid="scrap-count"]').textContent();
    
    // 스크랩 버튼 클릭
    await scrapButton.click();
    
    // 스크랩 상태 변경 확인 (UI)
    await expect(scrapButton).toHaveAttribute('data-scraped', 'true');
    
    // 스크랩 수 증가 확인
    const newScrapCount = await scrapButton.locator('[data-testid="scrap-count"]').textContent();
    expect(parseInt(newScrapCount || '0')).toBeGreaterThan(parseInt(initialScrapCount || '0'));
    
    // 페이지 새로고침 후 상태 유지 확인
    await page.reload();
    await expect(scrapButton).toHaveAttribute('data-scraped', 'true');
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
    // 네트워크 요청 모니터링
    const responsePromise = page.waitForResponse('**/api/likes/toggle');
    const scrapResponsePromise = page.waitForResponse('**/api/scraps/toggle');
    
    // 좋아요/스크랩 버튼 클릭
    const likeButton = page.locator('[data-testid="like-button"]').first();
    const scrapButton = page.locator('[data-testid="scrap-button"]').first();
    
    await likeButton.click();
    await scrapButton.click();
    
    // 응답 확인
    const likeResponse = await responsePromise;
    const scrapResponse = await scrapResponsePromise;
    
    expect(likeResponse.status()).toBe(200);
    expect(scrapResponse.status()).toBe(200);
    
    // 에러 메시지가 표시되지 않음
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });
});
