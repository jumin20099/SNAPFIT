import { test, expect } from "@playwright/test";

test.describe("간단한 좋아요 테스트", () => {
  test("좋아요 버튼 클릭 시 콘솔 로그 확인", async ({ page }) => {
    // 커뮤니티 페이지로 이동
    await page.goto("http://localhost:3000/community");
    
    // 페이지 로딩 대기
    await page.waitForLoadState("networkidle");
    
    // 첫 번째 좋아요 버튼 찾기
    const likeButton = page.locator("[data-testid=\"like-button\"]").first();
    await expect(likeButton).toBeVisible();
    
    // 초기 상태 확인
    const initialLiked = await likeButton.getAttribute("data-liked");
    console.log("초기 좋아요 상태:", initialLiked);
    
    // 좋아요 버튼 클릭
    await likeButton.click();
    
    // 잠시 대기 (API 호출 및 상태 업데이트 대기)
    await page.waitForTimeout(2000);
    
    // 클릭 후 상태 확인
    const afterClickLiked = await likeButton.getAttribute("data-liked");
    console.log("클릭 후 좋아요 상태:", afterClickLiked);
    
    // 좋아요 수 확인
    const likeCount = await page.locator("[data-testid=\"like-count\"]").first().textContent();
    console.log("좋아요 수:", likeCount);
  });
});
