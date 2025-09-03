import { test, expect } from '@playwright/test';

test.describe('상품 상호작용', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('상품 좋아요 토글이 작동해야 한다', async ({ page }) => {
    // 상품 카드 찾기
    const productCard = page.locator('[data-testid="product-card"]').first();
    await expect(productCard).toBeVisible();

    // 좋아요 버튼 클릭
    const likeButton = productCard.locator('[data-testid="like-button"]');
    await likeButton.click();

    // 좋아요 상태 변경 확인
    await expect(likeButton).toHaveClass(/liked/);

    // 다시 클릭하여 취소
    await likeButton.click();
    await expect(likeButton).not.toHaveClass(/liked/);
  });

  test('상품 스크랩이 작동해야 한다', async ({ page }) => {
    // 상품 상세 페이지로 이동
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.click();

    await page.waitForURL(/\/products\/\d+/);

    // 스크랩 버튼 클릭
    const scrapButton = page.locator('[data-testid="scrap-button"]');
    await scrapButton.click();

    // 스크랩 상태 변경 확인
    await expect(scrapButton).toHaveClass(/scrapped/);
  });

  test('상품을 장바구니에 추가할 수 있어야 한다', async ({ page }) => {
    // 상품 상세 페이지로 이동
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.click();

    await page.waitForURL(/\/products\/\d+/);

    // 장바구니 추가 버튼 클릭
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
    await addToCartButton.click();

    // 성공 메시지 확인
    await expect(page.locator('text=장바구니에 추가되었습니다')).toBeVisible();

    // 장바구니 아이콘에 개수 표시 확인
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');
  });

  test('상품 검색이 작동해야 한다', async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('티셔츠');

    // 검색 결과 확인
    await page.waitForSelector('[data-testid="search-results"]');
    const searchResults = page.locator('[data-testid="search-results"]');
    await expect(searchResults).toBeVisible();

    // 검색 결과에 상품이 표시되는지 확인
    const productCards = searchResults.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount.greaterThan(0);
  });

  test('카테고리 필터링이 작동해야 한다', async ({ page }) => {
    // 카테고리 탭 클릭
    const categoryTab = page.locator('[data-testid="category-tab"]').filter({ hasText: '상의' });
    await categoryTab.click();

    // 상품 목록이 필터링되는지 확인
    await page.waitForSelector('[data-testid="product-grid"]');
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toBeVisible();

    // 모든 상품이 상의 카테고리인지 확인
    const productCards = productGrid.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    
    for (let i = 0; i < count; i++) {
      const category = await productCards.nth(i).locator('[data-testid="product-category"]').textContent();
      expect(category).toBe('상의');
    }
  });
});
