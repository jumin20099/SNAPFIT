"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { generateCodyThumbnail } from '@/lib/image-utils'

interface OutfitSectionProps {
  productId: number
  productName: string
}

interface Outfit {
  outfitIdx: number
  outfitName: string
  outfitThumbnail?: string
  outfitItem: any
  isPublic: boolean
  createdAt: string
  user: {
    userIdx: string
    nickname: string
    profileImage?: string
  }
}

export default function OutfitSection({ 
  productId, 
  productName 
}: OutfitSectionProps) {
  
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const hasFetched = useRef(false)
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})
  const [thumbnailLoading, setThumbnailLoading] = useState<Record<string, boolean>>({})

  // 코디 목록 조회
  const fetchOutfits = async (reset = false) => {
    try {
      setLoading(true)
      const currentPage = reset ? 0 : page
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(
        `${API_BASE_URL}/api/outfits/product/${productId}?page=${currentPage}&size=10`,
        { credentials: 'include' }
      )
      
      if (response.ok) {
        const data = await response.json()
        const allOutfits = data || []
        console.log(`상품 ${productId} 코디 필터링 시작 - 전체 코디 수: ${allOutfits.length}`)

        // 상품 ID를 포함한 코디만 필터링
        const filteredOutfits = allOutfits.filter((outfit: any) => {
          const outfitItem = outfit.outfitItem
          if (!outfitItem) return false

          // JSON 문자열인 경우 파싱
          let items
          if (typeof outfitItem === 'string') {
            try {
              const parsed = JSON.parse(outfitItem)
              items = parsed.items || []
            } catch {
              return false
            }
          } else {
            items = outfitItem.items || []
          }

          // 상품 ID 검색 (정확한 매칭)
          const hasProduct = items.some((item: any) => {
            // 1. 정확한 경로 매칭: products/28/
            if (item.src && item.src.includes(`/products/${productId}/`)) {
              console.log(`상품 ${productId} 발견 (정확한 경로):`, item.src)
              return true
            }
            // 2. itemId로 검색 (JSON 문자열 형태)
            if (item.itemId && item.itemId === productId.toString()) {
              console.log(`상품 ${productId} 발견 (itemId):`, item.itemId)
              return true
            }
            // 3. 잘못된 경로 상품들 (products/0/ 경로 사용)
            const wrongPathProducts: Record<number, string> = {
              28: '039c4ff9-b9df-4517-8876-6da29afe235b_', // 가방
              29: '2626cbaf-eeb5-441c-b27a-bde1a23b5681_', // 모자
              30: '1b291969-93b9-4ea2-b1b9-c6185b446f1d_', // 목걸이
              31: '7ea1f11e-8048-4c7b-a8e0-6beb062829f9_', // 반지
              32: '0022c17c-f075-4395-827c-ac1928a7c08a_', // 손목시계
              33: '0ed5f16d-0567-48d2-9d55-2a977e0cfcc2_', // 신발
              34: 'eb44e4c7-4470-45bc-b75e-aff610c8f60c_', // 안경
            }
            
            if (wrongPathProducts[productId] && item.src && item.src.includes(`/products/0/${wrongPathProducts[productId]}`)) {
              console.log(`상품 ${productId} 발견 (잘못된 경로):`, item.src)
              return true
            }
            return false
          })
          
          if (!hasProduct) {
            console.log(`상품 ${productId} 없음 - 코디 ${outfit.outfitName}:`, items.map((i: any) => ({
              itemId: i.itemId,
              src: i.src,
              name: i.name,
              hasCorrectPath: i.src && i.src.includes(`/products/${productId}/`),
              hasItemId: i.itemId && i.itemId === productId.toString()
            })))
          }
          
          return hasProduct
        })
        
        console.log(`상품 ${productId} 필터링 결과: ${filteredOutfits.length}개 코디`)
        
        if (reset) {
          setOutfits(filteredOutfits)
        } else {
          setOutfits(prev => [...prev, ...filteredOutfits])
        }
        
        setHasMore(filteredOutfits.length === 10)
        setPage(currentPage + 1)
        
        // 상태 업데이트 로그 제거
      }
    } catch (error) {
      console.error('코디 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // productId가 변경되면 초기화
    hasFetched.current = false
    setOutfits([])
    setPage(0)
    setHasMore(true)
  }, [productId])

  useEffect(() => {
    if (!hasFetched.current) {
      fetchOutfits(true)
      hasFetched.current = true
    }
  }, [productId, hasFetched.current])

  // 코디 썸네일 생성
  const generateThumbnail = async (outfit: Outfit) => {
    const outfitId = outfit.outfitIdx.toString()
    
    // 이미 로딩 중이거나 썸네일이 있으면 스킵
    if (thumbnailLoading[outfitId] || thumbnails[outfitId]) {
      return
    }

    try {
      setThumbnailLoading(prev => ({ ...prev, [outfitId]: true }))
      
      let codyData
      if (typeof outfit.outfitItem === 'string') {
        codyData = JSON.parse(outfit.outfitItem)
      } else {
        codyData = outfit.outfitItem
      }
      
      console.log(`썸네일 생성 시작: 코디 #${outfitId}`, codyData)
      
      const thumbnailBlob = await generateCodyThumbnail(codyData)
      const thumbnailUrl = URL.createObjectURL(thumbnailBlob)
      
      console.log(`썸네일 생성 완료: 코디 #${outfitId}`, thumbnailUrl)
      setThumbnails(prev => ({ ...prev, [outfitId]: thumbnailUrl }))
    } catch (error) {
      console.error(`썸네일 생성 실패: 코디 #${outfitId}`, error)
    } finally {
      setThumbnailLoading(prev => ({ ...prev, [outfitId]: false }))
    }
  }

  // 코디 목록이 로드되면 썸네일 생성
  useEffect(() => {
    if (outfits.length > 0) {
      outfits.forEach(outfit => {
        generateThumbnail(outfit)
      })
    }
  }, [outfits])

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      Object.values(thumbnails).forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [thumbnails])

  const renderOutfitCard = (outfit: Outfit) => {
    const outfitId = outfit.outfitIdx.toString()
    const generatedThumbnail = thumbnails[outfitId]
    const isLoading = thumbnailLoading[outfitId]
    
    // 생성된 썸네일이 있으면 사용, 없으면 백엔드 썸네일 사용
    const imageUrl = generatedThumbnail || outfit.outfitThumbnail;
    
    console.log(`코디 ${outfit.outfitName} 썸네일:`, {
      outfitThumbnail: outfit.outfitThumbnail,
      generatedThumbnail,
      finalImageUrl: imageUrl,
      isLoading
    });

    return (
      <Card key={outfit.outfitIdx} className="group hover:shadow-lg transition-shadow overflow-hidden">
        <div className="relative aspect-square">
          {isLoading ? (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={outfit.outfitName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // 이미지 로드 실패 시 fallback 처리
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span class="text-gray-400 dark:text-gray-500 text-sm">이미지 없음</span>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500 text-sm">이미지 없음</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square" />
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">이 상품을 사용한 코디</h2>
          <p className="text-sm text-gray-500 mt-1">
            {productName}을(를) 활용한 다양한 코디를 확인해보세요
          </p>
        </div>
        <Button variant="outline" size="sm">
          전체 보기
        </Button>
      </div>

             {/* 코디 목록 */}
             {/* 렌더링 상태 로그 제거 */}
             {loading ? (
               renderSkeleton()
             ) : outfits.length > 0 ? (
               <>
                 <div className="grid grid-cols-2 gap-4">
                   {outfits.map(renderOutfitCard)}
                 </div>
          
          {/* 더보기 버튼 */}
          {hasMore && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => fetchOutfits(false)}
                disabled={loading}
              >
                더 많은 코디 보기
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👗</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 코디가 없어요
          </h3>
          <p className="text-gray-500 mb-4">
            이 상품을 사용한 첫 번째 코디를 만들어보세요!
          </p>
          <Button>
            코디 만들기
          </Button>
        </div>
      )}
    </div>
  )
}
