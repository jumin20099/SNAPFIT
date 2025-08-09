import { test, expect } from '@playwright/test'

test.describe('상품 상세 페이지', () => {
  test('상세 진입/주요 요소 렌더/CTA 동작', async ({ page }) => {
    // 테스트에 사용할 상품 ID (마이그레이션 더미 기준 1 가정)
    const productId = 1

    await page.goto(`/products/${productId}`)

    // 로딩 스켈레톤이 잠깐 보일 수 있으나, 최종 요소 기준으로 검증
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/원$/)).toBeVisible()

    // Hero 이미지 렌더 (next/image는 img로 렌더됨)
    const imgs = page.locator('img')
    await expect(imgs.first()).toBeVisible()

    // CTA: 장바구니 버튼 존재
    await expect(page.getByRole('button', { name: '장바구니 담기' })).toBeVisible()

    // CTA: 좋아요 버튼(카운트 숫자 노출) 존재
    await expect(page.locator('button').filter({ hasText: /\d+/ })).toBeVisible()
  })
})


