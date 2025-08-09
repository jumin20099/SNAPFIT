import { test, expect } from '@playwright/test'

test.describe('상품 상세 페이지', () => {
  test('상세 진입/주요 요소 렌더/CTA 동작', async ({ page }) => {
    // 헬스체크로 백엔드 준비 확인
    await page.goto('/api/health')
    // 상품 목록 API를 통해 첫 상품 id 획득
    const res = await page.request.get('/api/products')
    expect(res.ok()).toBeTruthy()
    const products = await res.json()
    const productId = (Array.isArray(products) && products[0]?.productIdx) || 1

    await page.goto(`/products/${productId}`)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('product-price')).toBeVisible()

    // Hero 이미지 렌더 (next/image는 img로 렌더됨)
    await expect(page.locator('img').first()).toBeVisible()

    // CTA: 장바구니 / 좋아요 버튼 존재
    await expect(page.getByTestId('add-to-cart')).toBeVisible()
    await expect(page.getByTestId('like-button')).toBeVisible()

    // 실시간 뷰 카운트 영역 존재(데이터 없을 수 있음)
    await expect(page.getByTestId('view-count')).toBeVisible()
  })
})


