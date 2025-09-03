import { test, expect } from '@playwright/test';

test.describe('코디 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('코디 시스템을 열고 닫을 수 있어야 한다', async ({ page }) => {
    // 상품 카드에서 코디 해보기 버튼 클릭
    const productCard = page.locator('[data-testid="product-card"]').first();
    const codyButton = productCard.locator('[data-testid="cody-button"]');
    await codyButton.click();

    // 코디 시스템이 열리는지 확인
    const codySystem = page.locator('[data-testid="cody-system"]');
    await expect(codySystem).toBeVisible();

    // 닫기 버튼 클릭
    const closeButton = codySystem.locator('[data-testid="close-button"]');
    await closeButton.click();

    // 코디 시스템이 닫히는지 확인
    await expect(codySystem).not.toBeVisible();
  });

  test('상품을 코디에 추가할 수 있어야 한다', async ({ page }) => {
    // 코디 시스템 열기
    const productCard = page.locator('[data-testid="product-card"]').first();
    const codyButton = productCard.locator('[data-testid="cody-button"]');
    await codyButton.click();

    const codySystem = page.locator('[data-testid="cody-system"]');
    await expect(codySystem).toBeVisible();

    // 상품 목록에서 첫 번째 상품 클릭
    const productList = codySystem.locator('[data-testid="product-list"]');
    const firstProduct = productList.locator('[data-testid="product-item"]').first();
    await firstProduct.click();

    // 코디 캐릭터에 상품이 추가되는지 확인
    const codyCharacter = codySystem.locator('[data-testid="cody-character"]');
    const addedItem = codyCharacter.locator('[data-testid="cody-item"]');
    await expect(addedItem).toBeVisible();
  });

  test('코디에서 상품을 제거할 수 있어야 한다', async ({ page }) => {
    // 코디 시스템 열기
    const productCard = page.locator('[data-testid="product-card"]').first();
    const codyButton = productCard.locator('[data-testid="cody-button"]');
    await codyButton.click();

    const codySystem = page.locator('[data-testid="cody-system"]');
    await expect(codySystem).toBeVisible();

    // 상품 추가
    const productList = codySystem.locator('[data-testid="product-list"]');
    const firstProduct = productList.locator('[data-testid="product-item"]').first();
    await firstProduct.click();

    // 추가된 상품의 제거 버튼 클릭
    const codyCharacter = codySystem.locator('[data-testid="cody-character"]');
    const removeButton = codyCharacter.locator('[data-testid="remove-item-button"]');
    await removeButton.click();

    // 상품이 제거되는지 확인
    const addedItem = codyCharacter.locator('[data-testid="cody-item"]');
    await expect(addedItem).not.toBeVisible();
  });

  test('코디를 저장할 수 있어야 한다', async ({ page }) => {
    // 코디 시스템 열기
    const productCard = page.locator('[data-testid="product-card"]').first();
    const codyButton = productCard.locator('[data-testid="cody-button"]');
    await codyButton.click();

    const codySystem = page.locator('[data-testid="cody-system"]');
    await expect(codySystem).toBeVisible();

    // 상품 추가
    const productList = codySystem.locator('[data-testid="product-list"]');
    const firstProduct = productList.locator('[data-testid="product-item"]').first();
    await firstProduct.click();

    // 저장 버튼 클릭
    const saveButton = codySystem.locator('[data-testid="save-cody-button"]');
    await saveButton.click();

    // 성공 메시지 확인
    await expect(page.locator('text=코디가 저장되었습니다')).toBeVisible();
  });

  test('카테고리별로 상품을 필터링할 수 있어야 한다', async ({ page }) => {
    // 코디 시스템 열기
    const productCard = page.locator('[data-testid="product-card"]').first();
    const codyButton = productCard.locator('[data-testid="cody-button"]');
    await codyButton.click();

    const codySystem = page.locator('[data-testid="cody-system"]');
    await expect(codySystem).toBeVisible();

    // 카테고리 탭 클릭
    const categoryTab = codySystem.locator('[data-testid="category-tab"]').filter({ hasText: '상의' });
    await categoryTab.click();

    // 상품 목록이 필터링되는지 확인
    const productList = codySystem.locator('[data-testid="product-list"]');
    await expect(productList).toBeVisible();

    // 모든 상품이 상의 카테고리인지 확인
    const productItems = productList.locator('[data-testid="product-item"]');
    const count = await productItems.count();
    
    for (let i = 0; i < count; i++) {
      const category = await productItems.nth(i).locator('[data-testid="product-category"]').textContent();
      expect(category).toBe('상의');
    }
  });
});
