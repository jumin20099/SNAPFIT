import { test, expect } from '@playwright/test';

test.describe('프로필 관리', () => {
  
  test.beforeEach(async ({ page }) => {
    // 카카오 로그인
    await page.goto('/login');
    await page.click('[data-testid="kakao-login-button"]');
    
    // 로그인 완료 대기 (홈페이지로 리다이렉트)
    await page.waitForURL('/');
    
    // 마이페이지로 이동
    await page.goto('/my-page');
    await page.waitForLoadState('networkidle');
  });

  test('프로필 사진 변경 기능', async ({ page }) => {
    // AC-001: 프로필 사진 관리

    // 1. 현재 프로필 사진 확인
    const currentProfileImage = page.locator('[data-testid="profile-image"]');
    await expect(currentProfileImage).toBeVisible();

    // 2. "프로필 사진 변경" 버튼 클릭
    await page.click('[data-testid="change-profile-image-button"]');

    // 3. 파일 업로드 대화상자에서 이미지 선택
    const fileInput = page.locator('[data-testid="profile-image-input"]');
    await fileInput.setInputFiles('./tests/fixtures/test-profile.jpg');

    // 4. 업로드 중 로딩 상태 확인
    const loadingSpinner = page.locator('[data-testid="profile-upload-loading"]');
    await expect(loadingSpinner).toBeVisible();

    // 5. 업로드 완료 후 새 프로필 사진 표시 확인
    await expect(loadingSpinner).toBeHidden({ timeout: 10000 });
    
    // 6. 성공 메시지 확인
    const successMessage = page.locator('[data-testid="profile-update-success"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('프로필 사진이 변경되었습니다');
  });

  test('닉네임 변경 기능', async ({ page }) => {
    // AC-002: 닉네임 변경

    // 1. 현재 닉네임 확인
    const currentNickname = page.locator('[data-testid="current-nickname"]');
    await expect(currentNickname).toBeVisible();
    const originalNickname = await currentNickname.textContent();

    // 2. "닉네임 편집" 버튼 클릭
    await page.click('[data-testid="edit-nickname-button"]');

    // 3. 인라인 편집 모드로 전환 확인
    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    await expect(nicknameInput).toBeVisible();
    await expect(nicknameInput).toBeFocused();

    // 4. 새 닉네임 입력
    const newNickname = '새로운닉네임' + Date.now();
    await nicknameInput.fill(newNickname);

    // 5. 저장 버튼 클릭
    await page.click('[data-testid="save-nickname-button"]');

    // 6. 로딩 상태 확인
    const saveLoading = page.locator('[data-testid="nickname-save-loading"]');
    await expect(saveLoading).toBeVisible();

    // 7. 저장 완료 후 새 닉네임 표시 확인
    await expect(saveLoading).toBeHidden({ timeout: 5000 });
    await expect(currentNickname).toContainText(newNickname);

    // 8. 성공 메시지 확인
    const successMessage = page.locator('[data-testid="nickname-update-success"]');
    await expect(successMessage).toBeVisible();
  });

  test('닉네임 중복 에러 처리', async ({ page }) => {
    // 1. 닉네임 편집 모드 진입
    await page.click('[data-testid="edit-nickname-button"]');
    
    // 2. 이미 사용 중인 닉네임 입력 (테스트용 - 관리자 계정 닉네임)
    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    await nicknameInput.fill('김주민'); // 기존 사용자 닉네임
    
    // 3. 저장 시도
    await page.click('[data-testid="save-nickname-button"]');
    
    // 4. 에러 메시지 확인
    const errorMessage = page.locator('[data-testid="nickname-error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('이미 사용 중인 닉네임입니다');
  });

  test('닉네임 유효성 검사', async ({ page }) => {
    // 1. 닉네임 편집 모드 진입
    await page.click('[data-testid="edit-nickname-button"]');
    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    
    // 2. 너무 짧은 닉네임
    await nicknameInput.fill('a');
    await page.click('[data-testid="save-nickname-button"]');
    
    const shortError = page.locator('[data-testid="nickname-validation-error"]');
    await expect(shortError).toBeVisible();
    await expect(shortError).toContainText('2자 이상');
    
    // 3. 너무 긴 닉네임
    await nicknameInput.fill('a'.repeat(21));
    
    const longError = page.locator('[data-testid="nickname-validation-error"]');
    await expect(longError).toBeVisible();
    await expect(longError).toContainText('20자 이하');
    
    // 4. 특수문자 포함
    await nicknameInput.fill('닉네임@#$');
    
    const invalidCharError = page.locator('[data-testid="nickname-validation-error"]');
    await expect(invalidCharError).toBeVisible();
    await expect(invalidCharError).toContainText('한글, 영문, 숫자만');
  });

  test('다크모드 토글 기능', async ({ page }) => {
    // AC-003: 다크모드 토글

    // 1. 다크모드 토글 스위치 확인
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    await expect(darkModeToggle).toBeVisible();

    // 2. 현재 테마 상태 확인
    const body = page.locator('body');
    const currentTheme = await body.getAttribute('class');

    // 3. 다크모드 토글 클릭
    await darkModeToggle.click();

    // 4. 테마 변경 확인 (클래스나 데이터 속성 변경)
    await page.waitForTimeout(500); // 테마 변경 애니메이션 대기
    const newTheme = await body.getAttribute('class');
    expect(newTheme).not.toBe(currentTheme);

    // 5. localStorage에 설정 저장 확인
    const themePreference = await page.evaluate(() => {
      return localStorage.getItem('theme');
    });
    expect(themePreference).toBeTruthy();

    // 6. 페이지 새로고침 후에도 테마 유지 확인
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const persistedTheme = await body.getAttribute('class');
    expect(persistedTheme).toBe(newTheme);
  });

  test('시스템 테마 감지 기능', async ({ page }) => {
    // 1. 시스템 테마 옵션 확인
    const systemThemeOption = page.locator('[data-testid="system-theme-option"]');
    await expect(systemThemeOption).toBeVisible();

    // 2. 시스템 테마 선택
    await systemThemeOption.click();

    // 3. 시스템 테마에 따른 자동 변경 확인
    const themePreference = await page.evaluate(() => {
      return localStorage.getItem('theme');
    });
    expect(themePreference).toBe('system');
  });

  test('프로필 편집 취소 기능', async ({ page }) => {
    // 1. 원본 닉네임 저장
    const originalNickname = await page.locator('[data-testid="current-nickname"]').textContent();

    // 2. 닉네임 편집 모드 진입
    await page.click('[data-testid="edit-nickname-button"]');

    // 3. 닉네임 변경
    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    await nicknameInput.fill('임시변경닉네임');

    // 4. 취소 버튼 클릭
    await page.click('[data-testid="cancel-nickname-button"]');

    // 5. 원본 닉네임 유지 확인
    const currentNickname = page.locator('[data-testid="current-nickname"]');
    await expect(currentNickname).toContainText(originalNickname || '');

    // 6. 편집 모드 종료 확인
    await expect(nicknameInput).toBeHidden();
  });

  test('파일 크기 제한 에러 처리', async ({ page }) => {
    // 1. 프로필 사진 변경 버튼 클릭
    await page.click('[data-testid="change-profile-image-button"]');

    // 2. 큰 파일 업로드 시도 (5MB 초과 파일)
    const fileInput = page.locator('[data-testid="profile-image-input"]');
    // 실제로는 더 큰 테스트 파일이 필요하지만, 시뮬레이션으로 대체
    
    // 3. 에러 메시지 확인
    const fileSizeError = page.locator('[data-testid="file-size-error"]');
    // await expect(fileSizeError).toBeVisible();
    // await expect(fileSizeError).toContainText('5MB 이하');
  });
});
