import Image from 'next/image'
import AddToCartButton from '@/components/add-to-cart-button'
import LikeButton from '@/components/like-button'
import { formatCurrencyKRW } from '@/lib/utils'

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
  const apiBase = process.env.API_BASE_URL || 'http://localhost:8080'
  const res = await fetch(`${apiBase}/api/products/${productId}`, {
    // 상세는 신선도 우선. 이후 필요한 경우 revalidate로 변경 가능
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('상품 정보를 불러오지 못했습니다.')
  }
  return res.json()
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const detail = await getProductDetail(params.id)
  const p = detail.product

  return (
    <main className="mx-auto max-w-screen-lg p-4">
      {/* Hero 영역 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative w-full aspect-square">
          <Image
            src={p.productImage || '/placeholder.svg'}
            alt={p.productName}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover rounded-2xl"
            priority
          />
        </div>

        {/* 정보 및 CTA */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{p.productName}</h1>
          <p className="text-xl font-bold">{formatCurrencyKRW(p.productPrice)}</p>

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
          <p className="text-sm text-gray-500">동일 카테고리의 연관 상품을 준비 중입니다.</p>
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
    }
  } catch {
    return {
      title: '상품 상세 | Snapfit',
      description: '상품 상세 정보',
    }
  }
}


