"use client"

import Image from 'next/image'
import { formatCurrencyKRW } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, Check } from 'lucide-react'
import CartSuccessModal from '@/components/ui/CartSuccessModal'
import { useRecentProducts } from '@/hooks/useRecentProducts'

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
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { addItem } = useCart()
  const { addRecentProduct } = useRecentProducts()

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
          
          // 최근 본 상품에 추가
          addRecentProduct({
            id: data.product.productIdx.toString(),
            name: data.product.productName,
            brand: data.product.storeName || 'SNAPFIT',
            price: data.product.productPrice,
            imageUrl: data.product.productImage
          })
          
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

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
    }
    
    checkLoginStatus()
    
    // 로그인 상태 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkLoginStatus()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])


  const handleAddToCart = () => {
    if (!detail) return
    
    try {
      setIsAddingToCart(true)
      
      // 장바구니에 상품 추가
      addItem({
        id: detail.product.productIdx,
        name: detail.product.productName,
        price: detail.product.productPrice,
        image: detail.product.productImage
      })
      
      // 성공 시 팝업 모달 표시
      setShowCartModal(true)
      
    } catch (error) {
      console.error('장바구니 추가 실패:', error)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleLike = async () => {
    if (!detail || isLiking) return
    
    // 로그인 상태 확인
    const token = localStorage.getItem('token')
    if (!token) {
      alert('좋아요 기능을 사용하려면 로그인이 필요합니다.')
      return
    }
    
    try {
      setIsLiking(true)
      
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetIdx: detail.product.productIdx,
          targetType: 'PRODUCT'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setDetail(prev => prev ? {
          ...prev,
          likedByUser: data.liked,
          likesCount: data.count
        } : null)
      } else {
        console.error('좋아요 토글 실패:', response.status)
        if (response.status === 401) {
          alert('로그인이 필요합니다.')
        }
      }
    } catch (error) {
      console.error('좋아요 토글 중 오류:', error)
    } finally {
      setIsLiking(false)
    }
  }

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
      
      {/* 성공 토스트 */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="w-4 h-4" />
          상품이 장바구니에 추가되었습니다!
        </div>
      )}
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
            <Button 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddingToCart ? '추가 중...' : '장바구니 담기'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleToggleLike}
              disabled={isLiking || !isLoggedIn}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                !isLoggedIn 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : detail.likedByUser 
                    ? 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={!isLoggedIn ? '로그인이 필요합니다' : ''}
            >
              <Heart className={`w-4 h-4 ${detail.likedByUser ? 'fill-red-500' : ''}`} />
              {isLiking ? '처리 중...' : (detail.likesCount || 0)}
            </Button>
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
                <div key={rp.productIdx} className="group">
                  <a href={`/products/${rp.productIdx}`} className="block">
                    <div className="relative w-full aspect-square mb-2">
                      <Image src={rp.productImage || '/placeholder.svg'} alt={rp.productName} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 320px" className="object-cover rounded" />
                    </div>
                    <div className="text-sm font-medium line-clamp-2">{rp.productName}</div>
                    <div className="text-xs text-blue-600 font-semibold">{formatCurrencyKRW(rp.productPrice)}</div>
                  </a>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      addItem({
                        id: rp.productIdx,
                        name: rp.productName,
                        price: rp.productPrice,
                        image: rp.productImage
                      })
                      setShowCartModal(true)
                    }}
                    className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    담기
                  </Button>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>
      
      {/* 장바구니 성공 모달 */}
      {detail && (
        <CartSuccessModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          productName={detail.product.productName}
          productImage={detail.product.productImage}
          productPrice={detail.product.productPrice}
        />
      )}
    </main>
  )
}


