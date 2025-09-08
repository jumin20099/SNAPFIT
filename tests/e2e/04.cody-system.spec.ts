import { test, expect } from '@playwright/test';

test.describe('코디 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cody');
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

  test('상품 위치 정확도 테스트 - 새로고침 후 0.5px 이하 오차', async ({ page }) => {
    // 코디 페이지로 이동
    await page.goto('/cody');
    await page.waitForLoadState('networkidle');

    // 카테고리 모달 열기
    const categoryButton = page.locator('button[class*="w-12 h-12"]').first();
    await categoryButton.click();

    // 상품 추가 (첫 번째 상품)
    const productGrid = page.locator('[class*="grid grid-cols-2"]').first();
    const firstProduct = productGrid.locator('button').first();
    await firstProduct.click();

    // 상품이 추가되었는지 확인
    const codyArea = page.locator('[class*="relative w-full"]').first();
    const addedItem = codyArea.locator('img[class*="object-contain"]').first();
    await expect(addedItem).toBeVisible();

    // 상품 위치 기록
    const initialBoundingBox = await addedItem.boundingBox();
    expect(initialBoundingBox).toBeTruthy();

    // 상품을 드래그하여 위치 변경
    await addedItem.dragTo(codyArea, {
      targetPosition: { x: 200, y: 300 }
    });

    // 드래그 후 위치 기록
    const draggedBoundingBox = await addedItem.boundingBox();
    expect(draggedBoundingBox).toBeTruthy();

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 새로고침 후 상품 위치 확인
    const reloadedItem = codyArea.locator('img[class*="object-contain"]').first();
    await expect(reloadedItem).toBeVisible();

    const reloadedBoundingBox = await reloadedItem.boundingBox();
    expect(reloadedBoundingBox).toBeTruthy();

    // 위치 오차 계산 (0.5px 이하)
    const deltaX = Math.abs((draggedBoundingBox?.x || 0) - (reloadedBoundingBox?.x || 0));
    const deltaY = Math.abs((draggedBoundingBox?.y || 0) - (reloadedBoundingBox?.y || 0));

    expect(deltaX).toBeLessThanOrEqual(0.5);
    expect(deltaY).toBeLessThanOrEqual(0.5);
  });

  test('다양한 화면 크기에서 위치 정확도 테스트', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/cody');
      await page.waitForLoadState('networkidle');

      // 카테고리 모달 열기
      const categoryButton = page.locator('button[class*="w-12 h-12"]').first();
      await categoryButton.click();

      // 상품 추가
      const productGrid = page.locator('[class*="grid grid-cols-2"]').first();
      const firstProduct = productGrid.locator('button').first();
      await firstProduct.click();

      // 상품 위치 확인
      const codyArea = page.locator('[class*="relative w-full"]').first();
      const addedItem = codyArea.locator('img[class*="object-contain"]').first();
      await expect(addedItem).toBeVisible();

      const boundingBox = await addedItem.boundingBox();
      expect(boundingBox).toBeTruthy();

      // 캔버스 비율 확인 (1080:1920)
      const codyAreaBox = await codyArea.boundingBox();
      expect(codyAreaBox).toBeTruthy();
      
      const aspectRatio = (codyAreaBox?.width || 0) / (codyAreaBox?.height || 0);
      const expectedRatio = 1080 / 1920;
      const ratioError = Math.abs(aspectRatio - expectedRatio);
      
      expect(ratioError).toBeLessThan(0.01); // 1% 이하 오차
    }
  });

  test('모바일 주소창 변화 대응 테스트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cody');
    await page.waitForLoadState('networkidle');

    // 카테고리 모달 열기
    const categoryButton = page.locator('button[class*="w-12 h-12"]').first();
    await categoryButton.click();

    // 상품 추가
    const productGrid = page.locator('[class*="grid grid-cols-2"]').first();
    const firstProduct = productGrid.locator('button').first();
    await firstProduct.click();

    // 상품 위치 기록
    const codyArea = page.locator('[class*="relative w-full"]').first();
    const addedItem = codyArea.locator('img[class*="object-contain"]').first();
    await expect(addedItem).toBeVisible();

    const initialBoundingBox = await addedItem.boundingBox();
    expect(initialBoundingBox).toBeTruthy();

    // 주소창 숨김 시뮬레이션 (뷰포트 높이 증가)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(100); // 안정화 대기

    const afterBoundingBox = await addedItem.boundingBox();
    expect(afterBoundingBox).toBeTruthy();

    // 위치 변화가 최소화되었는지 확인
    const deltaX = Math.abs((initialBoundingBox?.x || 0) - (afterBoundingBox?.x || 0));
    const deltaY = Math.abs((initialBoundingBox?.y || 0) - (afterBoundingBox?.y || 0));

    // 주소창 변화로 인한 위치 변화는 10px 이하여야 함
    expect(deltaX).toBeLessThanOrEqual(10);
    expect(deltaY).toBeLessThanOrEqual(10);
  });
});
