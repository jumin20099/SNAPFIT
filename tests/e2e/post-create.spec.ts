import { test, expect } from '@playwright/test';

test.describe('Post Create', () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/');
  });

  test('커뮤니티 페이지에서 글쓰기 버튼 표시', async ({ page }) => {
    // 커뮤니티 버튼 클릭
    await page.getByRole('button', { name: '커뮤니티' }).click();
    
    // 커뮤니티 페이지로 이동 확인
    await expect(page.getByText('커뮤니티')).toBeVisible();
    
    // 글쓰기 버튼이 있는지 확인
    const writeButton = page.getByRole('button', { name: '글쓰기' }).first();
    expect(writeButton).toBeVisible();
  });

  test('로그인 없이 게시글 작성 시도 시 로그인 필요 화면 표시', async ({ page }) => {
    // 커뮤니티 페이지로 이동
    await page.goto('/community');
    
    // 글쓰기 버튼 클릭
    const writeButton = page.getByRole('button', { name: '글쓰기' }).first();
    await writeButton.click();
    
    // 로그인 필요 화면이 표시되는지 확인
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible();
    await expect(page.getByText('게시글을 작성하려면 로그인해주세요.')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인하기' })).toBeVisible();
  });

  test('로그인 후 게시글 작성 폼 표시', async ({ page }) => {
    // 로그인 토큰 시뮬레이션 (테스트용)
    await page.addInitScript(() => {
      localStorage.setItem('token', 'test-token');
    });
    
    // 커뮤니티 페이지로 이동
    await page.goto('/community');
    
    // 글쓰기 버튼 클릭
    const writeButton = page.getByRole('button', { name: '글쓰기' }).first();
    await writeButton.click();
    
    // 게시글 작성 폼이 표시되는지 확인
    await expect(page.getByText('글 작성')).toBeVisible();
    await expect(page.getByPlaceholder('제목을 입력하세요')).toBeVisible();
  });
});
