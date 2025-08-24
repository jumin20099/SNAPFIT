import { test, expect } from '@playwright/test';

/**
 * 차단 시스템 E2E 테스트
 * 
 * 테스트는 단일 진실원(SoT) - 이 테스트가 통과하면 기능이 완성된 것
 * 
 * AC1: 사용자는 게시글 작성자를 차단할 수 있다
 * AC2: 차단된 사용자의 게시글은 피드에서 보이지 않는다  
 * AC3: 차단된 사용자의 댓글은 보이지 않는다
 * AC4: 사용자는 차단 목록을 관리할 수 있다
 * AC5: 사용자는 차단을 해제할 수 있다
 */

test.describe('차단 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 전 로그인 (김주민 계정)
    await page.goto('/login');
    await page.click('[data-testid="kakao-login-button"]');
    await page.waitForURL('/');
  });

  test('AC1: 사용자는 게시글 작성자를 차단할 수 있다', async ({ page }) => {
    // 커뮤니티 페이지로 이동
    await page.goto('/community');
    
    // 다른 사용자의 게시글 찾기 (임시사용자 게시글)
    const postCard = page.locator('[data-testid="post-card"]').filter({
      has: page.locator('text=임시사용자')
    }).first();
    
    await expect(postCard).toBeVisible();
    
    // 차단 버튼 클릭 (게시글 상단 또는 사용자 프로필 영역에 있을 예정)
    await postCard.locator('[data-testid="block-user-button"]').click();
    
    // 차단 확인 모달
    await expect(page.locator('[data-testid="block-confirm-modal"]')).toBeVisible();
    await page.locator('[data-testid="confirm-block-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('text=사용자를 차단했습니다')).toBeVisible();
    
    // 차단 후 게시글이 즉시 숨겨지는지 확인
    await expect(postCard).not.toBeVisible();
  });

  test('AC2: 차단된 사용자의 게시글은 피드에서 보이지 않는다', async ({ page }) => {
    // 먼저 사용자 차단 (위 테스트와 동일한 프로세스)
    await page.goto('/community');
    
    const postCard = page.locator('[data-testid="post-card"]').filter({
      has: page.locator('text=임시사용자')
    }).first();
    
    if (await postCard.isVisible()) {
      await postCard.locator('[data-testid="block-user-button"]').click();
      await page.locator('[data-testid="confirm-block-button"]').click();
      await page.waitForTimeout(1000); // 차단 처리 대기
    }
    
    // 페이지 새로고침 후 차단된 사용자 게시글이 보이지 않는지 확인
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 임시사용자의 게시글이 더 이상 보이지 않아야 함
    const blockedUserPosts = page.locator('[data-testid="post-card"]').filter({
      has: page.locator('text=임시사용자')
    });
    
    await expect(blockedUserPosts).toHaveCount(0);
  });

  test('AC3: 차단된 사용자의 댓글은 보이지 않는다', async ({ page }) => {
    // 김주민의 게시글로 이동 (댓글이 있는 게시글)
    await page.goto('/community');
    
    const kimPost = page.locator('[data-testid="post-card"]').filter({
      has: page.locator('text=김주민')
    }).first();
    
    await kimPost.click();
    
    // 게시글 상세 페이지에서 임시사용자의 댓글 확인
    const tempUserComment = page.locator('[data-testid="comment-item"]').filter({
      has: page.locator('text=임시사용자')
    }).first();
    
    if (await tempUserComment.isVisible()) {
      // 댓글 작성자 차단
      await tempUserComment.locator('[data-testid="block-comment-author-button"]').click();
      await page.locator('[data-testid="confirm-block-button"]').click();
      
      // 차단 후 댓글이 숨겨지는지 확인
      await expect(tempUserComment).not.toBeVisible();
    }
  });

  test('AC4: 사용자는 차단 목록을 관리할 수 있다', async ({ page }) => {
    // 마이페이지로 이동
    await page.goto('/my-page');
    
    // 차단 목록 탭 클릭
    await page.locator('[data-testid="blocked-users-tab"]').click();
    
    // 차단 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="blocked-users-list"]')).toBeVisible();
    
    // 차단된 사용자가 목록에 나타나는지 확인 (이전 테스트에서 차단한 사용자)
    const blockedUserItem = page.locator('[data-testid="blocked-user-item"]').filter({
      has: page.locator('text=임시사용자')
    });
    
    if (await blockedUserItem.count() === 0) {
      // 차단된 사용자가 없으면 테스트용으로 하나 차단
      await page.goto('/community');
      const postCard = page.locator('[data-testid="post-card"]').filter({
        has: page.locator('text=임시사용자')
      }).first();
      
      if (await postCard.isVisible()) {
        await postCard.locator('[data-testid="block-user-button"]').click();
        await page.locator('[data-testid="confirm-block-button"]').click();
      }
      
      // 다시 차단 목록으로 이동
      await page.goto('/my-page');
      await page.locator('[data-testid="blocked-users-tab"]').click();
    }
    
    await expect(blockedUserItem).toBeVisible();
  });

  test('AC5: 사용자는 차단을 해제할 수 있다', async ({ page }) => {
    // 차단 목록으로 이동
    await page.goto('/my-page');
    await page.locator('[data-testid="blocked-users-tab"]').click();
    
    // 차단된 사용자 찾기
    const blockedUserItem = page.locator('[data-testid="blocked-user-item"]').first();
    
    if (await blockedUserItem.count() === 0) {
      // 테스트용 사용자 차단
      await page.goto('/community');
      const postCard = page.locator('[data-testid="post-card"]').filter({
        has: page.locator('text=임시사용자')
      }).first();
      
      if (await postCard.isVisible()) {
        await postCard.locator('[data-testid="block-user-button"]').click();
        await page.locator('[data-testid="confirm-block-button"]').click();
      }
      
      await page.goto('/my-page');
      await page.locator('[data-testid="blocked-users-tab"]').click();
    }
    
    // 차단 해제 버튼 클릭
    await blockedUserItem.locator('[data-testid="unblock-user-button"]').click();
    
    // 차단 해제 확인 모달
    await expect(page.locator('[data-testid="unblock-confirm-modal"]')).toBeVisible();
    await page.locator('[data-testid="confirm-unblock-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('text=차단을 해제했습니다')).toBeVisible();
    
    // 차단 목록에서 사용자가 제거되었는지 확인
    await expect(blockedUserItem).not.toBeVisible();
    
    // 커뮤니티로 이동해서 차단 해제된 사용자의 게시글이 다시 보이는지 확인
    await page.goto('/community');
    await page.waitForLoadState('networkidle');
    
    const unblockedUserPosts = page.locator('[data-testid="post-card"]').filter({
      has: page.locator('text=임시사용자')
    });
    
    // 차단 해제 후 게시글이 다시 보여야 함
    await expect(unblockedUserPosts.first()).toBeVisible();
  });

  test('차단 시스템 전체 플로우 테스트', async ({ page }) => {
    // 1. 초기 상태: 모든 게시글 보임
    await page.goto('/community');
    const initialPostCount = await page.locator('[data-testid="post-card"]').count();
    
    // 2. 사용자 차단
    const targetPost = page.locator('[data-testid="post-card"]').filter({
      has: page.locator('text=임시사용자')
    }).first();
    
    if (await targetPost.isVisible()) {
      await targetPost.locator('[data-testid="block-user-button"]').click();
      await page.locator('[data-testid="confirm-block-button"]').click();
      
      // 3. 차단 후 게시글 수 감소 확인
      await page.waitForTimeout(1000);
      const afterBlockPostCount = await page.locator('[data-testid="post-card"]').count();
      expect(afterBlockPostCount).toBeLessThan(initialPostCount);
      
      // 4. 차단 목록 확인
      await page.goto('/my-page');
      await page.locator('[data-testid="blocked-users-tab"]').click();
      await expect(page.locator('[data-testid="blocked-user-item"]')).toHaveCount(1);
      
      // 5. 차단 해제
      await page.locator('[data-testid="unblock-user-button"]').first().click();
      await page.locator('[data-testid="confirm-unblock-button"]').click();
      
      // 6. 차단 해제 후 게시글 복원 확인
      await page.goto('/community');
      await page.waitForLoadState('networkidle');
      const finalPostCount = await page.locator('[data-testid="post-card"]').count();
      expect(finalPostCount).toBe(initialPostCount);
    }
  });
});
