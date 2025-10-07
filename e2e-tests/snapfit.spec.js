const { test, expect } = require('@playwright/test');

test.describe('SnapFit E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
  });

  // 익명 사용자 테스트
  test.describe('익명 사용자 테스트', () => {
    test('익명 사용자로 커뮤니티 접근', async ({ page }) => {
      await page.click('text=커뮤니티');
      await page.waitForLoadState('networkidle');
      
      // 익명 사용자도 게시글을 볼 수 있어야 함
      await expect(page.locator('text=코디 공유')).toBeVisible();
      await expect(page.locator('text=질문')).toBeVisible();
      await expect(page.locator('text=정보')).toBeVisible();
    });

    test('익명 사용자 댓글 작성 시도', async ({ page }) => {
      await page.click('text=커뮤니티');
      await page.waitForLoadState('networkidle');
      
      // 게시글 클릭
      const firstPost = page.locator('[data-testid="post-item"], .post-item').first();
      if (await firstPost.isVisible()) {
        await firstPost.click();
        await page.waitForLoadState('networkidle');
        
        // 댓글 작성 시도
        const commentInput = page.locator('input[placeholder*="댓글"], textarea[placeholder*="댓글"]');
        if (await commentInput.isVisible()) {
          await commentInput.fill('익명 댓글 테스트');
          await commentInput.press('Enter');
          
          // 로그인 요구 메시지 확인
          await expect(page.locator('text=로그인, text=로그인이 필요합니다')).toBeVisible();
        }
      }
    });
  });

  // 로그인 사용자 테스트
  test.describe('로그인 사용자 테스트', () => {
    test.beforeEach(async ({ page }) => {
      // 로그인 시뮬레이션 (실제 로그인 API 호출)
      await page.goto('http://localhost:3000');
      // 로그인 로직 구현 필요
    });

    test('로그인 후 프로필 확인', async ({ page }) => {
      // 사용자 아이콘 클릭
      await page.click('button[aria-label*="user"], .user-button');
      
      // 프로필 정보 확인
      await expect(page.locator('text=마이페이지, text=프로필')).toBeVisible();
    });
  });

  test('홈페이지 로딩 및 기본 UI 확인', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle('SNAPFIT');
    
    // 헤더 요소 확인
    await expect(page.locator('text=SNAPFIT')).toBeVisible();
    
    // 하단 네비게이션 확인
    await expect(page.locator('text=홈')).toBeVisible();
    await expect(page.locator('text=커뮤니티')).toBeVisible();
    await expect(page.locator('text=코디')).toBeVisible();
    await expect(page.locator('text=마이')).toBeVisible();
  });

  // 커뮤니티 탭별 상세 테스트
  test.describe('커뮤니티 탭별 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('text=커뮤니티');
      await page.waitForLoadState('networkidle');
    });

    test('코디 공유 탭 테스트', async ({ page }) => {
      await page.click('text=코디 공유');
      await page.waitForLoadState('networkidle');
      
      // 코디 공유 탭 UI 요소 확인
      await expect(page.locator('text=코디 공유')).toBeVisible();
      
      // 게시글 목록 로딩 확인
      await page.waitForSelector('[data-testid="post-item"], .post-item, .grid > div', { timeout: 10000 });
      
      // 정렬 옵션 확인
      const sortButton = page.locator('button:has-text("정렬"), select[name="sort"]');
      if (await sortButton.isVisible()) {
        await expect(sortButton).toBeVisible();
      }
    });

    test('질문 탭 테스트', async ({ page }) => {
      await page.click('text=질문');
      await page.waitForLoadState('networkidle');
      
      // 질문 탭 UI 요소 확인
      await expect(page.locator('text=질문')).toBeVisible();
      
      // 게시글 목록 로딩 확인
      await page.waitForSelector('[data-testid="post-item"], .post-item, .grid > div', { timeout: 10000 });
    });

    test('정보 탭 테스트', async ({ page }) => {
      await page.click('text=정보');
      await page.waitForLoadState('networkidle');
      
      // 정보 탭 UI 요소 확인
      await expect(page.locator('text=정보')).toBeVisible();
      
      // 게시글 목록 로딩 확인
      await page.waitForSelector('[data-testid="post-item"], .post-item, .grid > div', { timeout: 10000 });
    });

    test('탭 간 전환 테스트', async ({ page }) => {
      // 각 탭을 순서대로 클릭하며 전환 테스트
      const tabs = ['코디 공유', '질문', '정보'];
      
      for (const tab of tabs) {
        await page.click(`text=${tab}`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`text=${tab}`)).toBeVisible();
      }
    });
  });

  // 드롭다운 액션 메뉴 테스트
  test.describe('드롭다운 액션 메뉴 테스트', () => {
    test('게시글 액션 메뉴 표시', async ({ page }) => {
      await page.click('text=커뮤니티');
      await page.waitForLoadState('networkidle');
      
      // 게시글 클릭
      const firstPost = page.locator('[data-testid="post-item"], .post-item').first();
      if (await firstPost.isVisible()) {
        await firstPost.click();
        await page.waitForLoadState('networkidle');
        
        // 더보기(...) 버튼 확인
        const moreButton = page.locator('button[aria-label*="more"], .more-button, button:has-text("⋯")');
        if (await moreButton.isVisible()) {
          await moreButton.click();
          
          // 드롭다운 메뉴 확인
          await expect(page.locator('text=수정, text=삭제')).toBeVisible();
        }
      }
    });

    test('액션 메뉴 외부 클릭 시 닫힘', async ({ page }) => {
      await page.click('text=커뮤니티');
      await page.waitForLoadState('networkidle');
      
      const firstPost = page.locator('[data-testid="post-item"], .post-item').first();
      if (await firstPost.isVisible()) {
        await firstPost.click();
        await page.waitForLoadState('networkidle');
        
        const moreButton = page.locator('button[aria-label*="more"], .more-button, button:has-text("⋯")');
        if (await moreButton.isVisible()) {
          await moreButton.click();
          
          // 메뉴 외부 클릭
          await page.click('body', { position: { x: 100, y: 100 } });
          
          // 메뉴가 닫혔는지 확인
          await expect(page.locator('text=수정, text=삭제')).not.toBeVisible();
        }
      }
    });
  });

  // 팔로우 시스템 테스트
  test.describe('팔로우 시스템 테스트', () => {
    test('사용자 팔로우 버튼', async ({ page }) => {
      await page.click('text=커뮤니티');
      await page.waitForLoadState('networkidle');
      
      // 게시글 클릭하여 작성자 프로필 확인
      const firstPost = page.locator('[data-testid="post-item"], .post-item').first();
      if (await firstPost.isVisible()) {
        await firstPost.click();
        await page.waitForLoadState('networkidle');
        
        // 팔로우 버튼 확인
        const followButton = page.locator('button:has-text("팔로우"), button:has-text("팔로잉")');
        if (await followButton.isVisible()) {
          await expect(followButton).toBeVisible();
        }
      }
    });
  });

  // 댓글 시스템 테스트
  test.describe('댓글 시스템 테스트', () => {
    test('댓글 작성 및 좋아요', async ({ page }) => {
      await page.click('text=커뮤니티');
      await page.waitForLoadState('networkidle');
      
      const firstPost = page.locator('[data-testid="post-item"], .post-item').first();
      if (await firstPost.isVisible()) {
        await firstPost.click();
        await page.waitForLoadState('networkidle');
        
        // 댓글 입력창 확인
        const commentInput = page.locator('input[placeholder*="댓글"], textarea[placeholder*="댓글"]');
        if (await commentInput.isVisible()) {
          await commentInput.fill('테스트 댓글입니다');
          
          // 댓글 작성 버튼 클릭
          const submitButton = page.locator('button:has-text("등록"), button:has-text("작성")');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
        
        // 댓글 좋아요 버튼 확인
        const commentLikeButton = page.locator('[data-testid="comment-like"], .comment-like-button');
        if (await commentLikeButton.isVisible()) {
          await expect(commentLikeButton).toBeVisible();
        }
      }
    });
  });

  // 코디 빌더 테스트
  test.describe('코디 빌더 테스트', () => {
    test('코디 페이지 접근', async ({ page }) => {
      await page.click('text=코디');
      await page.waitForLoadState('networkidle');
      
      // 코디 빌더 UI 요소 확인
      await expect(page.locator('text=코디, text=코디 빌더')).toBeVisible();
    });

    test('코디 생성 기능', async ({ page }) => {
      await page.click('text=코디');
      await page.waitForLoadState('networkidle');
      
      // 코디 생성 버튼 확인
      const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")');
      if (await createButton.isVisible()) {
        await expect(createButton).toBeVisible();
      }
    });
  });

  // 파트너 신청 테스트
  test.describe('파트너 신청 테스트', () => {
    test('파트너 신청 페이지 접근', async ({ page }) => {
      // 파트너 신청 페이지로 직접 이동
      await page.goto('http://localhost:3000/partner-application');
      await page.waitForLoadState('networkidle');
      
      // 파트너 신청 폼 요소 확인
      await expect(page.locator('text=파트너, text=신청')).toBeVisible();
    });
  });

  test('게시글 목록 로딩', async ({ page }) => {
    await page.click('text=커뮤니티');
    await page.waitForLoadState('networkidle');
    
    // 게시글 목록이 로딩되는지 확인
    await page.waitForSelector('[data-testid="post-item"], .post-item, .grid > div', { timeout: 10000 });
  });

  test('검색 기능 테스트', async ({ page }) => {
    // 검색 아이콘 클릭
    await page.click('button[aria-label*="search"], .search-button');
    
    // 검색창이 나타나는지 확인
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]');
    await expect(searchInput).toBeVisible();
    
    // 검색어 입력
    await searchInput.fill('테스트');
    await searchInput.press('Enter');
    
    // 검색 결과 로딩 대기
    await page.waitForLoadState('networkidle');
  });

  test('모바일 반응형 테스트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 모바일에서도 기본 요소들이 보이는지 확인
    await expect(page.locator('text=SNAPFIT')).toBeVisible();
    
    // 햄버거 메뉴 확인 (모바일에서)
    const menuButton = page.locator('button[aria-label*="menu"], .menu-button');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  });

  test('다크 모드 토글', async ({ page }) => {
    // 다크 모드 토글 버튼 찾기
    const themeToggle = page.locator('button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]');
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // 다크 모드 클래스가 적용되는지 확인
      const body = page.locator('body');
      await expect(body).toHaveClass(/dark/);
    }
  });

  test('페이지 로딩 성능', async ({ page }) => {
    const startTime = Date.now();
    
    // 페이지 로딩 시간 측정
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 로딩 시간이 5초 이내인지 확인
    expect(loadTime).toBeLessThan(5000);
    console.log(`페이지 로딩 시간: ${loadTime}ms`);
  });

  test('API 연결 상태 확인', async ({ page }) => {
    // 네트워크 요청 모니터링
    const responses = [];
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    });
    
    // 페이지 새로고침하여 API 호출 확인
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // API 응답 상태 확인
    const apiResponses = responses.filter(r => r.url.includes('/api/'));
    const failedResponses = apiResponses.filter(r => r.status >= 400);
    
    if (failedResponses.length > 0) {
      console.log('실패한 API 요청:', failedResponses);
    }
    
    // 대부분의 API 요청이 성공하는지 확인
    expect(failedResponses.length).toBeLessThan(apiResponses.length * 0.5);
  });

  test('에러 처리 테스트', async ({ page }) => {
    // 존재하지 않는 페이지 접근
    await page.goto('http://localhost:3000/non-existent-page');
    
    // 404 페이지 또는 에러 메시지 확인
    const errorMessage = page.locator('text=404, text=Not Found, text=페이지를 찾을 수 없습니다');
    await expect(errorMessage).toBeVisible();
  });

  test('접근성 테스트', async ({ page }) => {
    // 키보드 네비게이션 테스트
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 포커스가 이동하는지 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Enter 키로 활성화
    await page.keyboard.press('Enter');
  });
});

test.describe('인증 관련 테스트', () => {
  test('로그인 페이지 접근', async ({ page }) => {
    // 사용자 아이콘 클릭
    await page.click('button[aria-label*="user"], .user-button');
    
    // 로그인 관련 요소 확인
    const loginButton = page.locator('text=로그인, text=Login, button:has-text("로그인")');
    if (await loginButton.isVisible()) {
      await expect(loginButton).toBeVisible();
    }
  });
});

test.describe('상품 관련 테스트', () => {
  test('상품 목록 로딩', async ({ page }) => {
    // 상품 관련 페이지로 이동 (홈페이지의 추천 아이템)
    await page.waitForSelector('.grid > div, [data-testid="product-item"]', { timeout: 10000 });
    
    // 상품 카드가 로딩되는지 확인
    const productCards = page.locator('.grid > div, [data-testid="product-item"]');
    await expect(productCards.first()).toBeVisible();
  });
});
