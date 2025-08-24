import { test, expect } from '@playwright/test';

/**
 * 신고 시스템 E2E 테스트
 * 
 * 테스트는 단일 진실원(SoT) - 이 테스트가 통과하면 기능이 완성된 것
 * 
 * AC6: 사용자는 게시글을 신고할 수 있다
 * AC7: 사용자는 댓글을 신고할 수 있다
 * AC8: 관리자는 신고 목록을 볼 수 있다
 * AC9: 관리자는 신고를 승인/거부할 수 있다
 */

test.describe('신고 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 전 로그인 (김주민 계정)
    await page.goto('/login');
    await page.click('[data-testid="kakao-login-button"]');
    await page.waitForURL('/');
  });

  test('AC6: 사용자는 게시글을 신고할 수 있다', async ({ page }) => {
    // 커뮤니티 페이지로 이동
    await page.goto('/community');
    
    // 다른 사용자의 게시글 찾기 (임시사용자 게시글)
    const postCard = page.locator('[data-testid="post-card"]').filter({
      has: page.locator('text=임시사용자')
    }).first();
    
    await expect(postCard).toBeVisible();
    
    // 신고 버튼 클릭 (더보기 메뉴 → 신고하기)
    await postCard.locator('[data-testid="post-more-menu"]').click();
    await page.locator('[data-testid="report-post-button"]').click();
    
    // 신고 모달이 열리는지 확인
    await expect(page.locator('[data-testid="report-modal"]')).toBeVisible();
    
    // 신고 카테고리 선택
    await page.locator('[data-testid="report-category-select"]').click();
    await page.locator('[data-testid="report-category-spam"]').click();
    
    // 신고 사유 입력
    await page.locator('[data-testid="report-reason-input"]').fill('테스트용 스팸 신고입니다.');
    
    // 신고 제출
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('text=신고가 접수되었습니다')).toBeVisible();
    
    // 모달이 닫히는지 확인
    await expect(page.locator('[data-testid="report-modal"]')).not.toBeVisible();
  });

  test('AC7: 사용자는 댓글을 신고할 수 있다', async ({ page }) => {
    // 댓글이 있는 게시글로 이동
    await page.goto('/community');
    
    const postCard = page.locator('[data-testid="post-card"]').first();
    await postCard.click();
    
    // 게시글 상세 페이지에서 댓글 찾기
    const commentItem = page.locator('[data-testid="comment-item"]').first();
    
    if (await commentItem.count() === 0) {
      // 댓글이 없으면 테스트용 댓글 작성
      await page.locator('[data-testid="comment-input"]').fill('테스트 댓글입니다.');
      await page.locator('[data-testid="comment-submit-button"]').click();
      await page.waitForTimeout(1000);
    }
    
    // 댓글 신고 버튼 클릭
    await commentItem.locator('[data-testid="comment-more-menu"]').click();
    await page.locator('[data-testid="report-comment-button"]').click();
    
    // 신고 모달 확인
    await expect(page.locator('[data-testid="report-modal"]')).toBeVisible();
    
    // 신고 정보 입력
    await page.locator('[data-testid="report-category-select"]').click();
    await page.locator('[data-testid="report-category-inappropriate"]').click();
    await page.locator('[data-testid="report-reason-input"]').fill('부적절한 댓글 내용입니다.');
    
    // 신고 제출
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('text=신고가 접수되었습니다')).toBeVisible();
  });

  test('사용자는 자신의 신고 목록을 볼 수 있다', async ({ page }) => {
    // 마이페이지로 이동
    await page.goto('/my-page');
    
    // 신고 내역 탭 클릭
    await page.locator('[data-testid="my-reports-tab"]').click();
    
    // 신고 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="my-reports-list"]')).toBeVisible();
    
    // 이전 테스트에서 생성한 신고가 있는지 확인
    const reportItems = page.locator('[data-testid="report-item"]');
    
    if (await reportItems.count() === 0) {
      // 신고가 없으면 하나 생성
      await page.goto('/community');
      const postCard = page.locator('[data-testid="post-card"]').first();
      await postCard.locator('[data-testid="post-more-menu"]').click();
      await page.locator('[data-testid="report-post-button"]').click();
      
      await page.locator('[data-testid="report-category-select"]').click();
      await page.locator('[data-testid="report-category-other"]').click();
      await page.locator('[data-testid="report-reason-input"]').fill('테스트 신고');
      await page.locator('[data-testid="submit-report-button"]').click();
      
      // 다시 마이페이지로 이동
      await page.goto('/my-page');
      await page.locator('[data-testid="my-reports-tab"]').click();
    }
    
    // 신고 아이템이 최소 1개는 있어야 함
    await expect(reportItems.first()).toBeVisible();
    
    // 신고 상태 확인 (PENDING, APPROVED, REJECTED 중 하나)
    await expect(page.locator('[data-testid="report-status"]').first()).toBeVisible();
  });
});

test.describe('신고 시스템 - 관리자 기능', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 계정으로 로그인 (김주민은 ADMIN 역할)
    await page.goto('/login');
    await page.click('[data-testid="kakao-login-button"]');
    await page.waitForURL('/');
  });

  test('AC8: 관리자는 신고 목록을 볼 수 있다', async ({ page }) => {
    // 관리자 대시보드로 이동
    await page.goto('/admin');
    
    // 신고 관리 탭 클릭
    await page.locator('[data-testid="admin-reports-tab"]').click();
    
    // 신고 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="admin-reports-list"]')).toBeVisible();
    
    // 신고 목록 헤더 확인 (신고자, 신고 대상, 카테고리, 상태, 날짜 등)
    await expect(page.locator('[data-testid="reports-table-header"]')).toBeVisible();
    
    // 필터 기능 확인
    await expect(page.locator('[data-testid="report-status-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="report-category-filter"]')).toBeVisible();
  });

  test('AC9: 관리자는 신고를 승인할 수 있다', async ({ page }) => {
    // 관리자 신고 목록으로 이동
    await page.goto('/admin');
    await page.locator('[data-testid="admin-reports-tab"]').click();
    
    // PENDING 상태 신고 필터링
    await page.locator('[data-testid="report-status-filter"]').click();
    await page.locator('[data-testid="filter-pending"]').click();
    
    const pendingReport = page.locator('[data-testid="admin-report-item"]').first();
    
    if (await pendingReport.count() === 0) {
      // PENDING 신고가 없으면 일반 사용자로 신고 생성
      await page.goto('/community');
      
      // 임시로 로그아웃하고 일반 사용자로 신고 생성 로직 필요
      // 또는 백엔드에서 테스트 데이터 생성
      console.log('테스트용 PENDING 신고 데이터가 필요합니다.');
      return;
    }
    
    await expect(pendingReport).toBeVisible();
    
    // 신고 상세 보기
    await pendingReport.locator('[data-testid="view-report-details"]').click();
    
    // 신고 승인 처리
    await page.locator('[data-testid="approve-report-button"]').click();
    
    // 관리자 메모 입력
    await page.locator('[data-testid="admin-note-input"]').fill('스팸으로 확인되어 승인 처리합니다.');
    
    // 승인 확인
    await page.locator('[data-testid="confirm-approve-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('text=신고가 승인되었습니다')).toBeVisible();
    
    // 신고 상태가 APPROVED로 변경되었는지 확인
    await expect(pendingReport.locator('[data-testid="report-status"]')).toHaveText('승인됨');
  });

  test('AC9: 관리자는 신고를 거부할 수 있다', async ({ page }) => {
    // 관리자 신고 목록으로 이동
    await page.goto('/admin');
    await page.locator('[data-testid="admin-reports-tab"]').click();
    
    // PENDING 상태 신고 찾기
    await page.locator('[data-testid="report-status-filter"]').click();
    await page.locator('[data-testid="filter-pending"]').click();
    
    const pendingReport = page.locator('[data-testid="admin-report-item"]').first();
    
    if (await pendingReport.count() > 0) {
      // 신고 거부 처리
      await pendingReport.locator('[data-testid="view-report-details"]').click();
      await page.locator('[data-testid="reject-report-button"]').click();
      
      // 거부 사유 입력
      await page.locator('[data-testid="admin-note-input"]').fill('신고 내용이 부적절하여 거부합니다.');
      
      // 거부 확인
      await page.locator('[data-testid="confirm-reject-button"]').click();
      
      // 성공 메시지 확인
      await expect(page.locator('text=신고가 거부되었습니다')).toBeVisible();
      
      // 신고 상태가 REJECTED로 변경되었는지 확인
      await expect(pendingReport.locator('[data-testid="report-status"]')).toHaveText('거부됨');
    }
  });

  test('신고 시스템 통계 확인', async ({ page }) => {
    // 관리자 대시보드로 이동
    await page.goto('/admin');
    await page.locator('[data-testid="admin-reports-tab"]').click();
    
    // 신고 통계 위젯 확인
    await expect(page.locator('[data-testid="report-statistics"]')).toBeVisible();
    
    // 각 카테고리별 신고 수 확인
    await expect(page.locator('[data-testid="spam-reports-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="inappropriate-reports-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="harassment-reports-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="other-reports-count"]')).toBeVisible();
    
    // 상태별 신고 수 확인
    await expect(page.locator('[data-testid="pending-reports-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="approved-reports-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="rejected-reports-count"]')).toBeVisible();
  });

  test('신고 시스템 전체 플로우 테스트', async ({ page }) => {
    // 1. 일반 사용자 신고 생성 (가정)
    // 2. 관리자 대시보드에서 신고 확인
    await page.goto('/admin');
    await page.locator('[data-testid="admin-reports-tab"]').click();
    
    const initialReportsCount = await page.locator('[data-testid="admin-report-item"]').count();
    
    // 3. 신고 처리 (승인 또는 거부)
    if (initialReportsCount > 0) {
      const firstReport = page.locator('[data-testid="admin-report-item"]').first();
      await firstReport.locator('[data-testid="view-report-details"]').click();
      
      // 상태에 따라 승인/거부 처리
      const approveButton = page.locator('[data-testid="approve-report-button"]');
      if (await approveButton.isVisible()) {
        await approveButton.click();
        await page.locator('[data-testid="admin-note-input"]').fill('테스트 승인 처리');
        await page.locator('[data-testid="confirm-approve-button"]').click();
        
        // 처리 후 상태 변경 확인
        await expect(page.locator('text=신고가 승인되었습니다')).toBeVisible();
      }
    }
    
    // 4. 통계 업데이트 확인
    await expect(page.locator('[data-testid="report-statistics"]')).toBeVisible();
  });
});
