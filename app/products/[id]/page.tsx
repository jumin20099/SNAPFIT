"use client"

import Image from 'next/image'
import { formatCurrencyKRW } from '@/lib/utils'
import { useEffect, useState } from 'react'

type Product = {
  productIdx: number
  productName: string
  productContent: string
  productPrice: number
  productImage: string
  majorCategory?: string
  subCategory?: string
  storeName?: string
}

type ProductDetailDto = {
  product: Product
  viewCount: number
  likesCount: number
  likedByUser: boolean
  liveViewers: number
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [detail, setDetail] = useState<ProductDetailDto | null>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true)
        
        // 클라이언트에서 직접 백엔드 API 호출 (쿠키 자동 전달)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
        const response = await fetch(`${API_BASE_URL}/api/products/${params.id}`, {
          credentials: 'include', // 쿠키 자동 전달
        })
        
        if (response.ok) {
          const data = await response.json()
          setDetail(data)
          
          // 연관 상품 가져오기
          const usp = new URLSearchParams()
          if (data.product.majorCategory) usp.append('major', data.product.majorCategory)
          if (data.product.subCategory) usp.append('sub', data.product.subCategory)
          
          const relatedResponse = await fetch(`${API_BASE_URL}/api/products${usp.toString() ? `?${usp.toString()}` : ''}`, {
            credentials: 'include',
          })
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json()
            const filteredRelated = Array.isArray(relatedData)
              ? relatedData
                  .filter((rp: any) => rp?.productIdx !== data.product.productIdx)
                  .filter((rp: any, idx: number, arr: any[]) => arr.findIndex((x: any) => x.productIdx === rp.productIdx) === idx)
                  .sort((a: any, b: any) => {
                    const subEqA = data.product.subCategory && a.subCategory === data.product.subCategory ? 1 : 0
                    const subEqB = data.product.subCategory && b.subCategory === data.product.subCategory ? 1 : 0
                    if (subEqA !== subEqB) return subEqB - subEqA
                    const priceA = Math.abs((a.productPrice ?? 0) - (data.product.productPrice ?? 0))
                    const priceB = Math.abs((b.productPrice ?? 0) - (data.product.productPrice ?? 0))
                    return priceA - priceB
                  })
              : []
            setRelated(filteredRelated)
          }
        }
      } catch (error) {
        console.error('상품 정보를 불러오지 못했습니다:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetail()
  }, [params.id])

  // 좋아요 상태를 주기적으로 확인 (무한 루프 방지)
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch('/api/likes/my', {
          credentials: 'include',
        })
        if (response.ok) {
          const likedIds = await response.json()
          const isLiked = likedIds.some((like: any) => 
            like.targetIdx === Number(params.id) && like.targetType === 'PRODUCT'
          )
          
          // 현재 상태와 다를 때만 업데이트 (무한 루프 방지)
          setDetail(prev => {
            if (prev && prev.likedByUser !== isLiked) {
              return {
                ...prev,
                likedByUser: isLiked
              }
            }
            return prev
          })
        }
      } catch (error) {
        console.error('좋아요 상태 확인 실패:', error)
      }
    }

    // 초기 로드 시 즉시 확인
    checkLikeStatus()
    
    // 이후 2초마다 좋아요 상태 확인
    const interval = setInterval(checkLikeStatus, 2000)
    return () => clearInterval(interval)
  }, [params.id])

  if (loading || !detail) {
    return (
      <main className="mx-auto max-w-screen-lg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </main>
    )
  }

  const p = detail.product
  const priceFormatted = formatCurrencyKRW(p.productPrice)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.productName,
    description: p.productContent,
    image: p.productImage ? [p.productImage] : [],
    brand: p.storeName || 'Snapfit',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KRW',
      price: p.productPrice,
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <main className="mx-auto max-w-screen-lg p-4">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero 영역 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative w-full aspect-square">
          <Image
            src={p.productImage || '/placeholder.svg'}
            alt={p.productName}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 640px"
            className="object-cover rounded-2xl"
            priority
          />
        </div>

        {/* 정보 및 CTA */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{p.productName}</h1>
          <p className="text-xl font-bold" data-testid="product-price">{priceFormatted}</p>

          <div className="flex gap-3 items-center">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              장바구니 담기
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              ♥ {detail.likesCount || 0}
            </button>
          </div>

          <ul className="text-sm text-gray-500 space-y-1">
            <li>
              누적 조회수 {Number(detail.viewCount || 0).toLocaleString()} · 좋아요{' '}
              {detail.likesCount?.toLocaleString?.() ?? detail.likesCount}
            </li>
            {p.storeName && <li>브랜드/스토어: {p.storeName}</li>}
            {(p.majorCategory || p.subCategory) && (
              <li>
                카테고리: {p.majorCategory}
                {p.subCategory ? ` > ${p.subCategory}` : ''}
              </li>
            )}
          </ul>

          {/* 실시간 조회수 표시 */}
          <div data-testid="view-count" aria-live="polite">
            <span className="text-sm text-gray-500">
              실시간 조회자: {detail.liveViewers || 0}명
            </span>
          </div>
        </div>
      </section>

      {/* 상세/연관 */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <article className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">상세 설명</h2>
          <p className="whitespace-pre-wrap text-gray-700">
            {p.productContent || '상품 설명이 없습니다.'}
          </p>
        </article>
        <aside className="space-y-4">
          <h3 className="font-semibold">연관 상품</h3>
          {related.length === 0 ? (
            <p className="text-sm text-gray-500">연관 상품이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {related.slice(0, 8).map((rp: any) => (
                <a key={rp.productIdx} href={`/products/${rp.productIdx}`} className="block">
                  <div className="relative w-full aspect-square mb-2">
                    <Image src={rp.productImage || '/placeholder.svg'} alt={rp.productName} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 320px" className="object-cover rounded" />
                  </div>
                  <div className="text-sm font-medium line-clamp-2">{rp.productName}</div>
                  <div className="text-xs text-blue-600 font-semibold">{formatCurrencyKRW(rp.productPrice)}</div>
                </a>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}


