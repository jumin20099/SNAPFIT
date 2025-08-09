import Image from 'next/image'
import AddToCartButton from '@/components/add-to-cart-button'
import LikeButton from '@/components/like-button'
import { formatCurrencyKRW } from '@/lib/utils'
import ViewCountDisplay from '@/components/ViewCountDisplay'

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
}

async function getProductDetail(productId: string): Promise<ProductDetailDto> {
  const res = await fetch(`/api/products/${productId}`, {
    // 상세는 신선도 우선. 이후 필요한 경우 revalidate로 변경 가능
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('상품 정보를 불러오지 못했습니다.')
  }
  return res.json()
}

async function getRelatedProducts(major?: string | null, sub?: string | null) {
  const usp = new URLSearchParams()
  if (major) usp.append('major', major)
  if (sub) usp.append('sub', sub as string)
  const res = await fetch(`/api/products${usp.toString() ? `?${usp.toString()}` : ''}`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  return res.json()
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const detail = await getProductDetail(params.id)
  const p = detail.product
  const relatedRaw = await getRelatedProducts(p.majorCategory, p.subCategory)
  const related = Array.isArray(relatedRaw)
    ? relatedRaw
        .filter((rp: any) => rp?.productIdx !== p.productIdx)
        .filter((rp: any, idx: number, arr: any[]) => arr.findIndex((x: any) => x.productIdx === rp.productIdx) === idx)
        .sort((a: any, b: any) => {
          const subEqA = p.subCategory && a.subCategory === p.subCategory ? 1 : 0
          const subEqB = p.subCategory && b.subCategory === p.subCategory ? 1 : 0
          if (subEqA !== subEqB) return subEqB - subEqA
          const priceA = Math.abs((a.productPrice ?? 0) - (p.productPrice ?? 0))
          const priceB = Math.abs((b.productPrice ?? 0) - (p.productPrice ?? 0))
          return priceA - priceB
        })
    : []

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
            <AddToCartButton
              product={{
                productIdx: p.productIdx,
                productName: p.productName,
                productPrice: p.productPrice,
                productImage: p.productImage,
              }}
            />
            <LikeButton
              targetIdx={p.productIdx}
              targetType="product"
              initialLiked={Boolean(detail.likedByUser)}
              initialCount={Number(detail.likesCount) || 0}
            />
          </div>

          <ul className="text-sm text-gray-500 space-y-1">
            <li>
              조회수 {detail.viewCount?.toLocaleString?.() ?? detail.viewCount} · 좋아요{' '}
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
            <ViewCountDisplay productId={p.productIdx} />
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

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const detail = await getProductDetail(params.id)
    const p = detail.product
    const title = `${p.productName} | Snapfit`
    const description = p.productContent?.slice(0, 120) || '상품 상세 정보'
    const images = [p.productImage].filter(Boolean)
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images,
        url: `/products/${params.id}`,
      },
      alternates: {
        canonical: `/products/${params.id}`,
      },
    }
  } catch {
    return {
      title: '상품 상세 | Snapfit',
      description: '상품 상세 정보',
    }
  }
}


