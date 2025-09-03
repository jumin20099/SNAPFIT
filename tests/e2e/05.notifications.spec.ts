import { test, expect } from '@playwright/test';

test.describe('알림 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('알림 배지가 표시되어야 한다', async ({ page }) => {
    // 알림 아이콘 찾기
    const notificationIcon = page.locator('[data-testid="notification-icon"]');
    await expect(notificationIcon).toBeVisible();

    // 읽지 않은 알림이 있을 때 배지 표시 확인
    const notificationBadge = page.locator('[data-testid="notification-badge"]');
    await expect(notificationBadge).toBeVisible();
  });

  test('알림 페이지를 열 수 있어야 한다', async ({ page }) => {
    // 알림 아이콘 클릭
    const notificationIcon = page.locator('[data-testid="notification-icon"]');
    await notificationIcon.click();

    // 알림 페이지가 열리는지 확인
    const notificationPage = page.locator('[data-testid="notification-page"]');
    await expect(notificationPage).toBeVisible();
  });

  test('알림을 읽음으로 표시할 수 있어야 한다', async ({ page }) => {
    // 알림 페이지 열기
    const notificationIcon = page.locator('[data-testid="notification-icon"]');
    await notificationIcon.click();

    const notificationPage = page.locator('[data-testid="notification-page"]');
    await expect(notificationPage).toBeVisible();

    // 첫 번째 알림 클릭
    const firstNotification = notificationPage.locator('[data-testid="notification-item"]').first();
    await firstNotification.click();

    // 알림이 읽음으로 표시되는지 확인
    await expect(firstNotification).toHaveClass(/read/);
  });

  test('모든 알림을 읽음으로 표시할 수 있어야 한다', async ({ page }) => {
    // 알림 페이지 열기
    const notificationIcon = page.locator('[data-testid="notification-icon"]');
    await notificationIcon.click();

    const notificationPage = page.locator('[data-testid="notification-page"]');
    await expect(notificationPage).toBeVisible();

    // 모든 알림 읽음 버튼 클릭
    const markAllReadButton = notificationPage.locator('[data-testid="mark-all-read-button"]');
    await markAllReadButton.click();

    // 모든 알림이 읽음으로 표시되는지 확인
    const notificationItems = notificationPage.locator('[data-testid="notification-item"]');
    const count = await notificationItems.count();
    
    for (let i = 0; i < count; i++) {
      await expect(notificationItems.nth(i)).toHaveClass(/read/);
    }

    // 알림 배지가 사라지는지 확인
    const notificationBadge = page.locator('[data-testid="notification-badge"]');
    await expect(notificationBadge).not.toBeVisible();
  });

  test('실시간 알림을 받을 수 있어야 한다', async ({ page }) => {
    // 알림 아이콘 클릭하여 알림 페이지 열기
    const notificationIcon = page.locator('[data-testid="notification-icon"]');
    await notificationIcon.click();

    const notificationPage = page.locator('[data-testid="notification-page"]');
    await expect(notificationPage).toBeVisible();

    // 초기 알림 개수 확인
    const initialCount = await notificationPage.locator('[data-testid="notification-item"]').count();

    // 다른 탭에서 좋아요 액션 수행 (실제로는 API 호출을 모킹)
    await page.evaluate(() => {
      // SSE 이벤트 시뮬레이션
      const event = new CustomEvent('notification', {
        detail: {
          id: Date.now(),
          type: 'like',
          title: '새로운 좋아요',
          message: '당신의 게시글에 좋아요가 눌렸습니다.',
          timestamp: new Date().toISOString(),
        }
      });
      window.dispatchEvent(event);
    });

    // 새 알림이 추가되는지 확인
    await expect(notificationPage.locator('[data-testid="notification-item"]')).toHaveCount(initialCount + 1);

    // 알림 배지가 업데이트되는지 확인
    const notificationBadge = page.locator('[data-testid="notification-badge"]');
    await expect(notificationBadge).toBeVisible();
  });

  test('알림 토스트가 표시되어야 한다', async ({ page }) => {
    // 좋아요 버튼 클릭하여 알림 트리거
    const productCard = page.locator('[data-testid="product-card"]').first();
    const likeButton = productCard.locator('[data-testid="like-button"]');
    await likeButton.click();

    // 토스트 알림이 표시되는지 확인
    const toast = page.locator('[data-testid="toast-notification"]');
    await expect(toast).toBeVisible();

    // 토스트 메시지 내용 확인
    await expect(toast).toContainText('좋아요를 눌렀습니다');
  });
});
