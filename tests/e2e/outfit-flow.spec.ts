import { test, expect } from '@playwright/test';

test.describe.skip('코디 시스템 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 메인 페이지로 이동
    await page.goto('/');
  });

  test('카테고리별 상품 리스트 로딩', async ({ page }) => {
    // 상의 카테고리 클릭
    await page.getByRole('button', { name: '상의' }).click();
    
    // 상품 리스트가 로딩되는지 확인
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible({ timeout: 10000 });
    
    // 하의 카테고리 클릭
    await page.getByRole('button', { name: '하의' }).click();
    
    // 상품 리스트가 다시 로딩되는지 확인
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible({ timeout: 10000 });
  });

  test('상품 클릭/선택 및 코디에 추가', async ({ page }) => {
    // 상의 카테고리 선택
    await page.getByRole('button', { name: '상의' }).click();
    
    // 첫 번째 상품 클릭
    await page.locator('[data-testid="product-card"]').first().click();
    
    // 코디 영역에 상품이 추가되었는지 확인
    await expect(page.locator('[data-testid="cody-item"]')).toBeVisible();
  });

  test('좋아요 기능', async ({ page }) => {
    // 상의 카테고리 선택
    await page.getByRole('button', { name: '상의' }).click();
    
    // 첫 번째 상품의 좋아요 버튼 클릭
    await page.locator('[data-testid="like-button"]').first().click();
    
    // 좋아요 상태가 변경되었는지 확인 (하트가 채워졌는지)
    await expect(page.locator('[data-testid="like-button"]').first()).toHaveClass(/filled/);
  });

  test('코디 저장 기능', async ({ page }) => {
    // 상의 카테고리에서 상품 선택
    await page.getByRole('button', { name: '상의' }).click();
    await page.locator('[data-testid="product-card"]').first().click();
    
    // 하의 카테고리에서 상품 선택
    await page.getByRole('button', { name: '하의' }).click();
    await page.locator('[data-testid="product-card"]').first().click();
    
    // 코디 저장 버튼 클릭
    await page.getByRole('button', { name: '코디 저장' }).click();
    
    // 저장 성공 메시지 확인
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
  });

  test('실시간 조회수 표시', async ({ page }) => {
    // 상품 상세 페이지로 이동 (예: 첫 번째 상품)
    await page.getByRole('button', { name: '상의' }).click();
    await page.locator('[data-testid="product-card"]').first().click();
    
    // 실시간 조회수 표시 확인
    await expect(page.locator('[data-testid="view-count"]')).toBeVisible();
    
    // 조회수 텍스트가 "n명이 보고 있어요" 형태인지 확인
    await expect(page.locator('[data-testid="view-count"]')).toContainText('명이 보고 있어요');
  });

  test('상품 검색 기능', async ({ page }) => {
    // 검색 버튼 클릭
    await page.getByRole('button', { name: '검색' }).click();
    
    // 검색어 입력
    await page.locator('[data-testid="search-input"]').fill('맨투맨');
    
    // 검색 결과 확인
    await expect(page.locator('[data-testid="search-result"]')).toBeVisible();
  });

  test('장바구니 기능', async ({ page }) => {
    // 상의 카테고리에서 상품을 장바구니에 추가
    await page.getByRole('button', { name: '상의' }).click();
    await page.locator('[data-testid="add-to-cart"]').first().click();
    
    // 장바구니 아이콘에 숫자 표시 확인
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });

  test('마이페이지 좋아요 목록', async ({ page }) => {
    // 마이페이지로 이동
    await page.getByRole('button', { name: '마이페이지' }).click();
    
    // 좋아요한 상품 탭 클릭
    await page.getByRole('button', { name: '좋아요한 상품' }).click();
    
    // 좋아요한 상품 목록 확인
    await expect(page.locator('[data-testid="liked-products"]')).toBeVisible();
  });

  test('전체 코디 시스템 플로우', async ({ page }) => {
    // 1. 카테고리 선택
    await page.getByRole('button', { name: '상의' }).click();
    
    // 2. 상품 선택 및 코디에 추가
    await page.locator('[data-testid="product-card"]').first().click();
    
    // 3. 다른 카테고리 선택
    await page.getByRole('button', { name: '하의' }).click();
    await page.locator('[data-testid="product-card"]').first().click();
    
    // 4. 좋아요 기능 테스트
    await page.locator('[data-testid="like-button"]').first().click();
    
    // 5. 코디 저장
    await page.getByRole('button', { name: '코디 저장' }).click();
    
    // 6. 저장 성공 확인
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
    
    // 7. 마이페이지에서 저장된 코디 확인
    await page.getByRole('button', { name: '마이페이지' }).click();
    await page.getByRole('button', { name: '내 코디' }).click();
    
    // 8. 저장된 코디 목록 확인
    await expect(page.locator('[data-testid="saved-outfit"]')).toBeVisible();
  });
}); 