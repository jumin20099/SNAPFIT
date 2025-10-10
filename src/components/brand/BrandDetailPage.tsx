"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { StickyHeader } from '@/components/ui/StickyHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LikeButton } from '@/features/reactions/LikeButton'
import { ProductCard } from '@/components/ui/ProductCard'
import { useStores } from '@/hooks/useStores'
import { useBatchReactionStatus } from '@/shared/hooks/useBatchReactionStatus'
import { formatCurrencyKRW } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Search } from 'lucide-react'

interface BrandDetailPageProps {
  brandId: string
}

interface BrandProduct {
  productIdx: number
  productName: string
  productPrice: number
  productImage: string
  majorCategory?: string
  subCategory?: string
  createdAt?: string
}

interface BrandOutfit {
  outfitIdx: number
  outfitName: string
  outfitThumbnail?: string
  outfitItem: any
  createdAt: string
  isPublic?: boolean
  user?: {
    nickname?: string
    profileImage?: string
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

async function fetchBrandProducts(brandId: string): Promise<BrandProduct[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/products?store_idx=${brandId}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('브랜드 상품을 불러오지 못했습니다.')
  }

  const data = await response.json()
  if (!Array.isArray(data)) return []

  return data.map((item: any) => ({
    productIdx: item.productIdx,
    productName: item.productName,
    productPrice: item.productPrice,
    productImage: item.productImage,
    majorCategory: item.majorCategory,
    subCategory: item.subCategory,
    createdAt: item.createdAt,
  }))
}

async function fetchPublicOutfits(): Promise<BrandOutfit[]> {
  const response = await fetch('/api/outfits?type=public', {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('공개 코디를 불러오지 못했습니다.')
  }

  const data = await response.json()
  if (!Array.isArray(data)) return []
  return data
}

async function fetchMyPublicOutfits(token: string): Promise<BrandOutfit[]> {
  const response = await fetch('/api/outfits?type=my', {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('내 코디를 불러오지 못했습니다.')
  }

  const data = await response.json()
  if (!Array.isArray(data)) return []
  return data.filter((outfit) => outfit?.isPublic)
}

function extractItems(outfitItem: any) {
  if (!outfitItem) return []
  if (typeof outfitItem === 'string') {
    try {
      const parsed = JSON.parse(outfitItem)
      if (Array.isArray(parsed)) return parsed
      if (parsed && Array.isArray(parsed.items)) return parsed.items
      return []
    } catch {
      return []
    }
  }
  if (Array.isArray(outfitItem)) return outfitItem
  if (Array.isArray(outfitItem.items)) return outfitItem.items
  return []
}

function itemMatchesBrand(item: any, productIds: Set<number>): boolean {
  const idsToCheck: (string | number | undefined)[] = [
    item?.itemId,
    item?.productId,
    item?.id,
  ]

  for (const rawId of idsToCheck) {
    const numericId = Number(rawId)
    if (!Number.isNaN(numericId) && productIds.has(numericId)) {
      return true
    }
  }

  const src: string | undefined = item?.src
  if (src) {
    const directMatch = src.match(/\/products\/(\d+)\//)
    if (directMatch) {
      const extracted = Number(directMatch[1])
      if (!Number.isNaN(extracted) && productIds.has(extracted)) {
        return true
      }
    }
  }

  return false
}

export default function BrandDetailPage({ brandId }: BrandDetailPageProps) {
  const router = useRouter()
  const numericBrandId = Number(brandId)
  const { data: stores } = useStores()
  const [searchTerm, setSearchTerm] = useState('')
  const [productSort, setProductSort] = useState<'latest' | 'price-asc' | 'price-desc' | 'name'>('latest')
  const [outfitSort, setOutfitSort] = useState<'recent' | 'oldest'>('recent')
  const [brandLikeState, setBrandLikeState] = useState({ liked: false, count: 0 })
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [displayedProductCount, setDisplayedProductCount] = useState(16)

  useEffect(() => {
    // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
    // 서버에서 자동으로 인증 처리
    setAuthToken(null)

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'token') {
        setAuthToken(event.newValue)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const brandStore = useMemo(() => {
    if (!stores || Number.isNaN(numericBrandId)) return undefined
    return stores.find((store) => store.storeIdx === numericBrandId)
  }, [stores, numericBrandId])

  const brandDisplayName = brandStore?.storeName || '브랜드'

  const { data: products, isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['brandProducts', numericBrandId],
    queryFn: () => fetchBrandProducts(brandId),
    enabled: !Number.isNaN(numericBrandId),
    staleTime: 2 * 60 * 1000,
  })

  const brandProductIds = useMemo(() => {
    if (!products) return []
    return products
      .map((product) => Number(product.productIdx))
      .filter((id) => !Number.isNaN(id))
  }, [products])

  const productIdSet = useMemo(() => new Set(brandProductIds), [brandProductIds])

  // 배치 상태 조회 (타입 안전)
  const { data: batchReactionStatus, manager: reactionManager } = useBatchReactionStatus({
    productIds: brandProductIds,
    enabled: brandProductIds.length > 0
  })

  const {
    data: publicOutfits,
    isLoading: publicOutfitsLoading,
    isError: publicOutfitsError,
  } = useQuery({
    queryKey: ['brandPublicOutfits', numericBrandId],
    queryFn: fetchPublicOutfits,
    enabled: productIdSet.size > 0,
    staleTime: 60 * 1000,
  })

  const {
    data: myPublicOutfits,
    isLoading: myOutfitsLoading,
    isError: myOutfitsError,
  } = useQuery({
    queryKey: ['brandMyPublicOutfits', numericBrandId, authToken],
    queryFn: () => fetchMyPublicOutfits(authToken as string),
    enabled: !!authToken && productIdSet.size > 0,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    let mounted = true
    const loadLikeState = async () => {
      try {
        const countRes = await fetch(`/api/likes/count?targetIdx=${brandId}&targetType=BRAND`, { cache: 'no-store' })
        let count = 0
        if (countRes.ok) {
          const text = await countRes.text()
          count = Number(text)
          if (Number.isNaN(count)) {
            const json = JSON.parse(text)
            if (typeof json === 'number') count = json
          }
        }

        let liked = false
        if (typeof window !== 'undefined') {
          // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
          // 서버에서 자동으로 인증 처리
          const likedRes = await fetch('/api/likes/my/brands', {
            credentials: 'include', // HttpOnly 쿠키 자동 전송
            cache: 'no-store',
          })
            if (likedRes.ok) {
              const likedData = await likedRes.json()
              if (Array.isArray(likedData)) {
                liked = likedData.some((item: any) => {
                  const value = item?.targetIdx ?? item?.brandId
                  return Number(value) === numericBrandId
                })
              }
            }
          }
        }

        if (mounted) {
          setBrandLikeState({ liked, count: Number.isNaN(count) ? 0 : count })
        }
      } catch (error) {
        console.error('브랜드 좋아요 상태를 불러오지 못했습니다:', error)
      }
    }

    if (!Number.isNaN(numericBrandId)) {
      loadLikeState()
    }

    return () => {
      mounted = false
    }
  }, [brandId, numericBrandId, authToken])

  const filteredProducts = useMemo(() => {
    if (!products) return []
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return products

    return products.filter((product) => {
      const nameMatch = product.productName?.toLowerCase().includes(keyword)
      const categoryMatch = product.subCategory?.toLowerCase().includes(keyword)
      return nameMatch || categoryMatch
    })
  }, [products, searchTerm])

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts]
    switch (productSort) {
      case 'price-asc':
        return items.sort((a, b) => (a.productPrice ?? 0) - (b.productPrice ?? 0))
      case 'price-desc':
        return items.sort((a, b) => (b.productPrice ?? 0) - (a.productPrice ?? 0))
      case 'name':
        return items.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''))
      case 'latest':
      default:
        return items.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })
    }
  }, [filteredProducts, productSort])

  // 상품 표시 로직
  const displayedProducts = useMemo(() => {
    if (!sortedProducts) return []
    
    let result: BrandProduct[] = []
    
    // 4개까지만 보여주고, 더보기 버튼으로 나머지 표시
    if (!showAllProducts) {
      result = sortedProducts.slice(0, 4)
    } else {
      // 더보기 버튼을 눌렀을 때는 displayedProductCount만큼 표시
      result = sortedProducts.slice(0, displayedProductCount)
    }
    
    console.log('📦 displayedProducts 계산:', {
      totalProducts: sortedProducts.length,
      showAllProducts,
      displayedProductCount,
      displayedCount: result.length
    })
    
    return result
  }, [sortedProducts, showAllProducts, displayedProductCount])

  // 더보기 핸들러
  const handleLoadMore = () => {
    setDisplayedProductCount(prev => prev + 16)
  }


  const brandOutfits = useMemo(() => {
    if (productIdSet.size === 0) return []

    const communityMatches = (publicOutfits || []).filter((outfit) => {
      const items = extractItems(outfit.outfitItem)
      return items.some((item: any) => itemMatchesBrand(item, productIdSet))
    })

    const myMatches = (myPublicOutfits || []).filter((outfit) => {
      const items = extractItems(outfit.outfitItem)
      return items.some((item: any) => itemMatchesBrand(item, productIdSet))
    })

    // 병합 시 커뮤니티 공개 코디와 사용자의 공개 코디를 모두 포함한다
    const combined = [...communityMatches, ...myMatches]
    const unique = new Map<number, BrandOutfit>()
    combined.forEach((outfit) => {
      if (outfit?.outfitIdx != null && !unique.has(outfit.outfitIdx)) {
        unique.set(outfit.outfitIdx, outfit)
      }
    })

    return Array.from(unique.values()).sort((a, b) => {
      const createdA = new Date(a.createdAt || 0).getTime()
      const createdB = new Date(b.createdAt || 0).getTime()
      return outfitSort === 'recent' ? createdB - createdA : createdA - createdB
    })
  }, [publicOutfits, myPublicOutfits, productIdSet, outfitSort])

  const outfitsLoading = publicOutfitsLoading || (!!authToken && myOutfitsLoading)
  const outfitsError = publicOutfitsError || (!!authToken && myOutfitsError)

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <StickyHeader
        selectedCategory="전체"
        onCategoryChange={() => {}}
        selectedGender="all"
        selectedMainCategory=""
        selectedSubCategory=""
        onCategorySelect={() => {}}
      />

      <main className="mx-auto max-w-screen-lg p-4 pb-24 space-y-10">
        <section className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/brands')
              }
            }} 
            aria-label="이전 페이지로"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">브랜드</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{brandDisplayName}</h1>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white/20 backdrop-blur">
                <Image
                  src={brandStore?.storeLogo || '/placeholder.svg'}
                  alt={`${brandDisplayName} 로고`}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <div>
                <h2 className="text-3xl font-semibold">{brandDisplayName}</h2>
                <p className="mt-2 max-w-xl text-sm text-white/80">
                  {brandStore?.storeLink
                    ? '브랜드의 공식 스토어와 상품, 코디를 한눈에 확인해보세요.'
                    : '브랜드에서 선보이는 상품과 코디를 만나보세요.'}
                </p>
                {brandStore?.storeLink && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={(event) => {
                      event.stopPropagation()
                      if (brandStore?.storeLink) {
                        window.open(brandStore.storeLink, '_blank')
                      }
                    }}
                  >
                    공식 스토어 바로가기
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {!Number.isNaN(numericBrandId) && (
              <LikeButton
                targetIdx={numericBrandId}
                targetType="brand"
                initialActive={brandLikeState.liked}
                initialCount={brandLikeState.count}
                className="self-start rounded-full bg-white/10 px-6 py-3 text-white backdrop-blur transition hover:bg-white/20"
              />
            )}
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">브랜드 정보</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">스토어 링크</p>
              {brandStore?.storeLink ? (
                <Button
                  variant="link"
                  className="mt-2 px-0 text-blue-600"
                  onClick={() => {
                    if (brandStore?.storeLink) {
                      window.open(brandStore.storeLink, '_blank')
                    }
                  }}
                >
                  {brandStore.storeLink}
                </Button>
              ) : (
                <p className="mt-2 text-sm text-gray-500">등록된 스토어 링크가 없습니다.</p>
              )}
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">문의</p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {brandStore?.contact || '제휴 문의를 통해 최신 정보를 확인해보세요.'}
              </p>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">브랜드 상품</h3>
              <p className="text-sm text-gray-500">정렬과 검색으로 원하는 상품을 빠르게 찾아보세요.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="상품 검색"
                  className="pl-9"
                />
              </div>
              <Select value={productSort} onValueChange={(value) => setProductSort(value as typeof productSort)}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="price-asc">가격 낮은순</SelectItem>
                  <SelectItem value="price-desc">가격 높은순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : productsError ? (
            <Card className="p-6 text-center text-sm text-red-500">
              브랜드 상품을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </Card>
          ) : sortedProducts.length === 0 ? (
            <Card className="p-10 text-center text-sm text-gray-500">
              표시할 상품이 없습니다. 다른 검색어로 다시 시도해주세요.
            </Card>
          ) : (
            <>
              <div className="min-h-[800px]">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.productIdx}
                    product={{
                      id: product.productIdx?.toString() || '0',
                      name: product.productName || '상품',
                      price: product.productPrice || 0,
                      imageUrl: product.productImage || '/placeholder.svg',
                      brand: brandDisplayName,
                      category: product.majorCategory || '',
                      subCategory: product.subCategory || '',
                      tags: [],
                      productIdx: product.productIdx,
                      productName: product.productName,
                      productPrice: product.productPrice,
                      productImage: product.productImage,
                      majorCategory: product.majorCategory,
                      storeName: brandDisplayName,
                      rating: 0,
                      reviewCount: 0,
                      isLiked: reactionManager.getProductStatus(product.productIdx)?.liked ?? false,
                      likeCount: reactionManager.getProductStatus(product.productIdx)?.likeCount ?? 0,
                    }}
                    onClick={() => router.push(`/products/${product.productIdx}`)}
                  />
                ))}
                </div>
              </div>
              
              {/* 더보기 버튼 (4개 이하일 때) */}
              {!showAllProducts && sortedProducts.length > 4 && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={() => setShowAllProducts(true)}
                    variant="outline"
                    className="px-8 py-2"
                  >
                    더보기 ({sortedProducts.length - 4}개 더)
                  </Button>
                </div>
              )}
              
              {/* 더보기 버튼 */}
              {showAllProducts && displayedProductCount < sortedProducts.length && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    더보기 ({sortedProducts.length - displayedProductCount}개 더)
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">브랜드 코디</h3>
              <p className="text-sm text-gray-500">
                {brandDisplayName} 브랜드 아이템이 활용된 코디를 모았습니다.
              </p>
            </div>
            <Select value={outfitSort} onValueChange={(value) => setOutfitSort(value as typeof outfitSort)}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">최신순</SelectItem>
                <SelectItem value="oldest">오래된순</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {outfitsLoading && productIdSet.size > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="aspect-[9/16]" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : outfitsError ? (
            <Card className="p-6 text-center text-sm text-red-500">
              브랜드 코디를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </Card>
          ) : brandOutfits.length === 0 ? (
            <Card className="p-10 text-center text-sm text-gray-500">
              아직 브랜드가 활용된 코디가 없습니다. 첫 번째 코디를 만들어보세요!
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brandOutfits.map((outfit) => (
                <Card key={outfit.outfitIdx} className="overflow-hidden">
                  <div className="relative aspect-[9/16] bg-gray-50">
                    {outfit.outfitThumbnail ? (
                      <Image
                        src={outfit.outfitThumbnail}
                        alt={outfit.outfitName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                        썸네일이 없습니다
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-50 line-clamp-2">
                      {outfit.outfitName || '코디' }
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(outfit.createdAt).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
