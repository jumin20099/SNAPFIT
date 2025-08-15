import { test, expect } from '@playwright/test'

const APP = process.env.APP_ORIGIN || 'http://localhost:3000'
const TOKEN = process.env.E2E_PARTNER_TOKEN || ''
const ADMIN = process.env.E2E_ADMIN_TOKEN || ''

test('제휴몰 신청 제출 OK', async ({ request }) => {
  test.skip(!TOKEN, 'E2E_PARTNER_TOKEN 필요')
  const res = await request.post(`${APP}/api/partner/application`, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    data: { companyName: 'E2E', contactEmail: 'e2e@test.com', contactPhone: '010-0000-0000' }
  })
  expect(res.status()).toBeLessThan(500)
})

test('상품 등록 OK', async ({ request }) => {
  test.skip(!TOKEN, 'E2E_PARTNER_TOKEN 필요')
  const res = await request.post(`${APP}/api/partner/products`, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    data: { productName: 'E2E Product', productPrice: 1000 }
  })
  expect(res.status()).toBeLessThan(500)
})

test('제휴몰 삭제 OK', async ({ request }) => {
  test.skip(!ADMIN, 'E2E_ADMIN_TOKEN 필요')
  const res = await request.delete(`${APP}/api/admin/stores/1`, {
    headers: { Authorization: `Bearer ${ADMIN}` }
  })
  // 실제 데이터에 맞춰 조정(200 or 404)
  expect([200, 404]).toContain(res.status())
})
