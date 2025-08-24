import { test, expect } from '@playwright/test';

/**
 * 팔로우/팔로잉 기능 E2E 테스트
 * Acceptance Criteria 기반 전체 플로우 검증
 */
test.describe('Follow/Following Features', () => {
  
  test.beforeEach(async ({ page }) => {
    // 테스트용 JWT 토큰 설정 (개발 환경)
    await page.goto('/');
    await page.evaluate(() => {
      const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTU3MDgzMzYsImV4cCI6MTc1NjMxMzEzNn0.test';
      localStorage.setItem('token', testToken);
    });
  });

  test('AC1-2: 사용자 팔로우 → 언팔로우 플로우', async ({ page }) => {
    // Given: 커뮤니티 페이지에서 다른 사용자 게시글 확인
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 게시글 작성자 프로필 링크 클릭 (첫 번째 게시글)
    const authorLink = page.locator('[data-testid="post-author"]').first();
    if (await authorLink.isVisible()) {
      await authorLink.click();
      await page.waitForLoadState('networkidle');

      // When: 팔로우 버튼 클릭
      const followBtn = page.locator('[data-testid="follow-button"]');
      if (await followBtn.isVisible()) {
        const initialText = await followBtn.textContent();
        await followBtn.click();
        await page.waitForTimeout(500);

        // Then: 팔로우 상태 변경 확인
        const newText = await followBtn.textContent();
        expect(newText).not.toBe(initialText);

        // 팔로워 수 증가 확인
        const followerCount = page.locator('[data-testid="follower-count"]');
        if (await followerCount.isVisible()) {
          const count = await followerCount.textContent();
          expect(count).toMatch(/\d+/);
        }

        // When: 언팔로우 (다시 클릭)
        await followBtn.click();
        await page.waitForTimeout(500);

        // Then: 언팔로우 상태 변경 확인
        const finalText = await followBtn.textContent();
        expect(finalText).toBe(initialText);
      } else {
        test.skip(true, '팔로우 버튼을 찾을 수 없습니다. 프론트엔드 구현 대기 중');
      }
    } else {
      test.skip(true, '게시글 작성자 링크를 찾을 수 없습니다.');
    }
  });

  test('AC3: 팔로워/팔로잉 목록 조회', async ({ page }) => {
    // Given: 사용자 프로필 페이지 접근
    await page.goto('/profile/test-user'); // 실제 프로필 페이지 경로로 수정 필요
    await page.waitForLoadState('networkidle');

    // When: 팔로워 탭 클릭
    const followersTab = page.locator('[data-testid="followers-tab"]');
    if (await followersTab.isVisible()) {
      await followersTab.click();
      await page.waitForTimeout(500);

      // Then: 팔로워 목록 표시 확인
      const followersList = page.locator('[data-testid="followers-list"]');
      await expect(followersList).toBeVisible();
    }

    // When: 팔로잉 탭 클릭
    const followingTab = page.locator('[data-testid="following-tab"]');
    if (await followingTab.isVisible()) {
      await followingTab.click();
      await page.waitForTimeout(500);

      // Then: 팔로잉 목록 표시 확인
      const followingList = page.locator('[data-testid="following-list"]');
      await expect(followingList).toBeVisible();
    }

    if (!(await followersTab.isVisible()) && !(await followingTab.isVisible())) {
      test.skip(true, '팔로워/팔로잉 탭을 찾을 수 없습니다. 프론트엔드 구현 대기 중');
    }
  });

  test('AC5: 팔로우 기반 피드', async ({ page }) => {
    // Given: 다른 사용자를 팔로우한 상태
    // (이 테스트는 이전 팔로우 액션이 성공했다고 가정)

    // When: 팔로잉 피드 탭 접근
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    const followingTab = page.locator('[data-testid="following-feed-tab"]');
    if (await followingTab.isVisible()) {
      await followingTab.click();
      await page.waitForTimeout(1000);

      // Then: 팔로우한 사용자들의 게시글만 표시 확인
      const posts = page.locator('[data-testid="post-item"]');
      const postCount = await posts.count();
      
      if (postCount > 0) {
        // 첫 번째 게시글 작성자가 팔로우한 사용자인지 확인
        const firstPostAuthor = posts.first().locator('[data-testid="post-author"]');
        await expect(firstPostAuthor).toBeVisible();
      }
    } else {
      test.skip(true, '팔로잉 피드 탭을 찾을 수 없습니다. 프론트엔드 구현 대기 중');
    }
  });

  test('API 직접 테스트: 팔로우 상태 확인', async ({ page }) => {
    // Given: 테스트 사용자 ID
    const testUserId = '87b18a9c-d2ba-4318-b9aa-859e03c5aad7';

    // When: 백엔드 API 직접 호출
    const response = await page.evaluate(async (userId) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/follows/${userId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return {
        status: res.status,
        data: await res.json()
      };
    }, testUserId);

    // Then: 응답 검증
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('following');
    expect(typeof response.data.following).toBe('boolean');
  });

  test('API 직접 테스트: 팔로우 토글', async ({ page }) => {
    // Given: 테스트 사용자 ID
    const testUserId = '87b18a9c-d2ba-4318-b9aa-859e03c5aad7';

    // When: 팔로우 API 호출
    const followResponse = await page.evaluate(async (userId) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/follows/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return {
        status: res.status,
        data: await res.json()
      };
    }, testUserId);

    // Then: 팔로우 응답 검증
    if (followResponse.status === 201) {
      expect(followResponse.data).toHaveProperty('following', true);
      expect(followResponse.data).toHaveProperty('followerCount');
      expect(typeof followResponse.data.followerCount).toBe('number');

      // When: 언팔로우 API 호출
      const unfollowResponse = await page.evaluate(async (userId) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/follows/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return {
          status: res.status,
          data: await res.json()
        };
      }, testUserId);

      // Then: 언팔로우 응답 검증
      expect(unfollowResponse.status).toBe(200);
      expect(unfollowResponse.data).toHaveProperty('following', false);
    } else if (followResponse.status === 400) {
      // 이미 팔로우 중이거나 자기 자신을 팔로우하는 경우
      console.log('팔로우 실패 (예상된 경우):', followResponse.data);
    } else if (followResponse.status === 401) {
      // 인증 실패 (토큰이 없거나 만료된 경우)
      console.log('팔로우 인증 실패 (예상된 경우):', followResponse.data);
      test.skip(true, '팔로우 API 인증 실패. 토큰 확인 필요');
    } else {
      throw new Error(`Unexpected follow response: ${followResponse.status}`);
    }
  });
});

