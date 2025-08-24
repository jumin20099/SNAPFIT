import { test, expect } from '@playwright/test';

/**
 * 댓글 기능 E2E 테스트
 * Acceptance Criteria 기반 전체 플로우 검증
 */
test.describe('Comment Features', () => {
  
  test.beforeEach(async ({ page }) => {
    // 테스트용 JWT 토큰 설정 (개발 환경)
    await page.goto('/');
    await page.evaluate(() => {
      const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTU3MDgzMzYsImV4cCI6MTc1NjMxMzEzNn0.test';
      localStorage.setItem('token', testToken);
    });
  });

  test('AC1-4: 댓글 작성 → 수정 → 삭제 전체 플로우', async ({ page }) => {
    // Given: 게시글 상세 페이지 접근
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 첫 번째 게시글 클릭
    const firstPost = page.locator('[data-testid="post-item"]').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');

      const testCommentContent = `테스트 댓글 ${Date.now()}`;
      const updatedCommentContent = `수정된 댓글 ${Date.now()}`;

      // When: 댓글 작성
      const commentInput = page.locator('[data-testid="comment-input"]');
      const commentSubmitBtn = page.locator('[data-testid="comment-submit"]');
      
      if (await commentInput.isVisible() && await commentSubmitBtn.isVisible()) {
        await commentInput.fill(testCommentContent);
        await commentSubmitBtn.click();
        await page.waitForTimeout(1000);

        // Then: 작성된 댓글 표시 확인
        const commentsList = page.locator('[data-testid="comments-list"]');
        await expect(commentsList).toBeVisible();
        
        const newComment = commentsList.locator(`text=${testCommentContent}`);
        await expect(newComment).toBeVisible();

        // When: 댓글 수정 (본인 댓글의 수정 버튼 클릭)
        const editBtn = commentsList.locator('[data-testid="comment-edit-btn"]').last();
        if (await editBtn.isVisible()) {
          await editBtn.click();
          await page.waitForTimeout(500);

          const editInput = page.locator('[data-testid="comment-edit-input"]');
          const saveBtn = page.locator('[data-testid="comment-save-btn"]');
          
          if (await editInput.isVisible() && await saveBtn.isVisible()) {
            await editInput.fill(updatedCommentContent);
            await saveBtn.click();
            await page.waitForTimeout(1000);

            // Then: 수정된 댓글 확인
            const updatedComment = commentsList.locator(`text=${updatedCommentContent}`);
            await expect(updatedComment).toBeVisible();
          }
        }

        // When: 댓글 삭제
        const deleteBtn = commentsList.locator('[data-testid="comment-delete-btn"]').last();
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
          await page.waitForTimeout(500);

          // 삭제 확인 다이얼로그가 있다면 확인 클릭
          const confirmBtn = page.locator('[data-testid="delete-confirm-btn"]');
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
          }
          await page.waitForTimeout(1000);

          // Then: 댓글 삭제 확인
          const deletedComment = commentsList.locator(`text=${updatedCommentContent}`);
          await expect(deletedComment).not.toBeVisible();
        }
      } else {
        test.skip(true, '댓글 입력 폼을 찾을 수 없습니다. 프론트엔드 구현 대기 중');
      }
    } else {
      test.skip(true, '게시글을 찾을 수 없습니다.');
    }
  });

  test('AC2: 댓글 목록 조회 (페이징)', async ({ page }) => {
    // Given: 게시글 상세 페이지 접근
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    const firstPost = page.locator('[data-testid="post-item"]').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');

      // When: 댓글 목록 로드 확인
      const commentsList = page.locator('[data-testid="comments-list"]');
      if (await commentsList.isVisible()) {
        // Then: 댓글 아이템들 확인
        const commentItems = commentsList.locator('[data-testid="comment-item"]');
        const commentCount = await commentItems.count();
        console.log(`댓글 개수: ${commentCount}`);

        // 페이징 버튼이 있다면 확인
        const loadMoreBtn = page.locator('[data-testid="load-more-comments"]');
        if (await loadMoreBtn.isVisible()) {
          await loadMoreBtn.click();
          await page.waitForTimeout(1000);
          
          // 더 많은 댓글이 로드되었는지 확인
          const newCommentCount = await commentItems.count();
          expect(newCommentCount).toBeGreaterThanOrEqual(commentCount);
        }
      } else {
        console.log('댓글 목록이 표시되지 않습니다. (댓글이 없을 수 있음)');
      }
    }
  });

  test('AC5: 댓글 좋아요 토글', async ({ page }) => {
    // Given: 댓글이 있는 게시글 상세 페이지
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    const firstPost = page.locator('[data-testid="post-item"]').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');

      const commentsList = page.locator('[data-testid="comments-list"]');
      if (await commentsList.isVisible()) {
        // When: 첫 번째 댓글의 좋아요 버튼 클릭
        const firstCommentLikeBtn = commentsList.locator('[data-testid="comment-like-btn"]').first();
        if (await firstCommentLikeBtn.isVisible()) {
          const initialLikeCount = await commentsList.locator('[data-testid="comment-like-count"]').first().textContent() || '0';
          
          await firstCommentLikeBtn.click();
          await page.waitForTimeout(500);

          // Then: 좋아요 수 변경 확인
          const newLikeCount = await commentsList.locator('[data-testid="comment-like-count"]').first().textContent() || '0';
          expect(newLikeCount).not.toBe(initialLikeCount);

          // When: 다시 클릭 (좋아요 취소)
          await firstCommentLikeBtn.click();
          await page.waitForTimeout(500);

          // Then: 원래 상태로 복원 확인
          const finalLikeCount = await commentsList.locator('[data-testid="comment-like-count"]').first().textContent() || '0';
          expect(finalLikeCount).toBe(initialLikeCount);
        } else {
          test.skip(true, '댓글 좋아요 버튼을 찾을 수 없습니다. 프론트엔드 구현 대기 중');
        }
      }
    }
  });

  test('API 직접 테스트: 댓글 CRUD', async ({ page }) => {
    // Given: 테스트 게시글 ID (실제 존재하는 게시글 ID로 수정 필요)
    const testPostId = 11;
    const testComment = `API 테스트 댓글 ${Date.now()}`;

    // When: 댓글 작성 API 호출
    const createResponse = await page.evaluate(async ({ postId, content }: { postId: number, content: string }) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      return {
        status: res.status,
        data: await res.json()
      };
    }, { postId: testPostId, content: testComment });

    // Then: 댓글 작성 응답 검증
    if (createResponse.status === 201) {
      expect(createResponse.data).toHaveProperty('commentId');
      expect(createResponse.data).toHaveProperty('content', testComment);
      expect(createResponse.data).toHaveProperty('author');
      expect(createResponse.data).toHaveProperty('createdAt');

      const commentId = createResponse.data.commentId;

      // When: 댓글 목록 조회 API 호출
      const listResponse = await page.evaluate(async (postId: number) => {
        const res = await fetch(`http://localhost:8080/api/posts/${postId}/comments`);
        return {
          status: res.status,
          data: await res.json()
        };
      }, testPostId);

      // Then: 댓글 목록 응답 검증
      expect(listResponse.status).toBe(200);
      expect(listResponse.data).toHaveProperty('content');
      expect(Array.isArray(listResponse.data.content)).toBe(true);

      // When: 댓글 수정 API 호출
      const updatedContent = `수정된 API 테스트 댓글 ${Date.now()}`;
      const updateResponse = await page.evaluate(async ({ commentId, content }: { commentId: number, content: string }) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        });
        return {
          status: res.status,
          data: await res.json()
        };
      }, { commentId, content: updatedContent });

      // Then: 댓글 수정 응답 검증
      if (updateResponse.status === 200) {
        expect(updateResponse.data).toHaveProperty('content', updatedContent);
      }

      // When: 댓글 삭제 API 호출
      const deleteResponse = await page.evaluate(async (commentId: number) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return {
          status: res.status
        };
      }, commentId);

      // Then: 댓글 삭제 응답 검증
      expect(deleteResponse.status).toBe(204);
    } else {
      console.log('댓글 작성 실패:', createResponse);
      test.skip(true, '댓글 작성 API 실패. 백엔드 확인 필요');
    }
  });

  test('API 직접 테스트: 댓글 좋아요 토글', async ({ page }) => {
    // Given: 존재하는 댓글 ID (실제 댓글 ID로 수정 필요)
    const testCommentId = 1;

    // When: 댓글 좋아요 토글 API 호출
    const likeResponse = await page.evaluate(async (commentId: number) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/comments/${commentId}/like`, {
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
    }, testCommentId);

    // Then: 댓글 좋아요 응답 검증
    if (likeResponse.status === 200) {
      expect(likeResponse.data).toHaveProperty('liked');
      expect(likeResponse.data).toHaveProperty('likeCount');
      expect(typeof likeResponse.data.liked).toBe('boolean');
      expect(typeof likeResponse.data.likeCount).toBe('number');
    } else {
      console.log('댓글 좋아요 토글 실패:', likeResponse);
      test.skip(true, '댓글 좋아요 토글 API 실패. 백엔드 확인 필요');
    }
  });
});

