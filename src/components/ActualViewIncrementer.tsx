"use client"

import { useEffect } from "react"

export default function ActualViewIncrementer({ productId }: { productId: number }) {
  useEffect(() => {
    if (!productId) return
    const controller = new AbortController()
    fetch(`/api/products/${productId}`, { method: 'POST', signal: controller.signal })
      .then(async (r) => {
        const text = await r.text().catch(() => '')
        // 디버그 로그 (필요 시 주석 처리)
        // eslint-disable-next-line no-console
        console.debug('[actual-view]', r.status, text)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [productId])
  return null
}


