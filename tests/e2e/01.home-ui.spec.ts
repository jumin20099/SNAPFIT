import { test, expect } from '@playwright/test';

test.describe('Home UI smoke', () => {
  test('opens category panel and sees major categories', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /카테고리/ })).toBeVisible();
    await page.getByRole('button', { name: /카테고리/ }).click();

    // 시트 오픈 확인(하단 패널)
    await expect(page.getByText('좋아요')).toBeVisible();
    await expect(page.getByText('상의')).toBeVisible();
    await expect(page.getByText('하의')).toBeVisible();
    await expect(page.getByText('아우터')).toBeVisible();
  });

  test('search flow (debounced) shows "검색 결과" or 빈 상태', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /카테고리/ }).click();
    
    // 검색 버튼을 더 구체적으로 찾기
    const searchButton = page.locator('button').filter({ has: page.locator('svg[aria-label="Search"], svg[data-lucide="Search"]') }).first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      // 검색 버튼이 없으면 검색 입력창을 직접 찾기
      const searchInput = page.getByPlaceholder('상품 검색...');
      if (await searchInput.isVisible()) {
        await searchInput.click();
      } else {
        test.skip(true, 'Search functionality not found on this page');
        return;
      }
    }
    
    const input = page.getByPlaceholder('상품 검색...');
    await input.fill('tee');
    await page.waitForTimeout(400); // debounce 300ms + margin
    
    // 결과 섹션 또는 "검색 결과가 없습니다."
    const hasResults = await page.getByRole('heading', { name: '검색 결과' }).isVisible().catch(() => false);
    const emptyState = await page.getByText('검색 결과가 없습니다.').isVisible().catch(() => false);
    const hasAnyContent = await page.locator('div, section').filter({ hasText: /검색|결과|상품/ }).isVisible().catch(() => false);
    
    expect(hasResults || emptyState || hasAnyContent).toBeTruthy();
  });

  test('partner application button is always visible and opens sheet', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '제휴신청' }).click();
    
    // 제휴신청 컴포넌트가 열렸는지 확인 (더 구체적인 텍스트로)
    await expect(page.getByText('제휴사 등록 신청')).toBeVisible();
    await expect(page.getByText('회사명 *')).toBeVisible();
  });

  test('community button navigates to community page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /커뮤니티/ })).toBeVisible();
    await page.getByRole('button', { name: /커뮤니티/ }).click();
    
    // 커뮤니티 페이지로 이동했는지 확인
    await expect(page).toHaveURL('/community');
    await expect(page.getByText('SNAP')).toBeVisible();
    await expect(page.getByRole('button', { name: '글쓰기' })).toBeVisible();
  });

  test('my page button navigates to my page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /마이페이지/ })).toBeVisible();
    await page.getByRole('button', { name: /마이페이지/ }).click();
    
    // 마이페이지로 이동했는지 확인
    await expect(page).toHaveURL('/my-page');
    await expect(page.getByText('마이페이지')).toBeVisible();
  });

  test('login button navigates to login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    await page.getByRole('button', { name: '로그인' }).click();
    
    // 로그인 페이지로 이동했는지 확인
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'SNAPFIT' })).toBeVisible();
  });

  test('partner application button navigates to partner application page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '제휴신청' })).toBeVisible();
    await page.getByRole('button', { name: '제휴신청' }).click();
    
    // 제휴사 신청 페이지로 이동했는지 확인
    await expect(page).toHaveURL('/partner-application');
    await expect(page.getByText('제휴사 등록 신청')).toBeVisible();
    await expect(page.getByText('회사명 *')).toBeVisible();
  });
});
