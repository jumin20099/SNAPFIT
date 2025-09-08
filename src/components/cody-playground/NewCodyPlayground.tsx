'use client'

import React, { useMemo, useRef, useState } from "react"
// import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Trash2, Move, RotateCcw } from "lucide-react"
import { CATEGORIES, type GenderCategory, type MainCategory, type CategoryItem } from '@/constants/categories'
import { CodyCategoryChips } from '@/components/ui/CodyCategoryChips'
import { PlacedItem, AssetMeta, AssetMetaManager, BASE_W, BASE_H, type Anchor } from '@/entities/cody/model'

// ===========================
// TYPES & TAXONOMY (필수만)
// ===========================

type Gender = "all" | "male" | "female"
type Major = "shoes" | "top" | "outer" | "bottom" | "dresses" | "bag" | "accessory" | "hat" | "glasses" | "jewelry" | "watch" | "belt" | "socks" | "ring" | "bracelet" | "necklace"

// 실제 API에서 데이터를 가져올 예정

// ===========================
// 가상 캔버스 및 뷰 변환 시스템
// ===========================

// 뷰 변환 정보
type ViewTransform = {
  scale: number
  offsetX: number
  offsetY: number
  containerW: number
  containerH: number
}

// 뷰 변환 계산 함수
function buildViewTransform(containerW: number, containerH: number): ViewTransform {
  const scale = Math.min(containerW / BASE_W, containerH / BASE_H)
  const offsetX = (containerW - BASE_W * scale) / 2
  const offsetY = (containerH - BASE_H * scale) / 2
  return { scale, offsetX, offsetY, containerW, containerH }
}

// 단일 변환 함수: (nx,ny,scale,hotspot) → (x,y,w,h) 유일 진입점
function computePixelRect(
  item: PlacedItem,
  transform: ViewTransform,
  baseImgW: number,
  baseImgH: number
) {
  // 정규화 좌표를 BASE 기준 픽셀 좌표로 변환
  const xBase = item.nx * BASE_W
  const yBase = item.ny * BASE_H

  // 자산 메타데이터에서 실제 크기와 핫스팟 가져오기
  const assetMeta = item.assetMeta
  const intrinsicW = assetMeta?.intrinsicWidth || baseImgW
  const intrinsicH = assetMeta?.intrinsicHeight || baseImgH
  const hotspot = assetMeta?.hotspot || { x: 0.5, y: 0.5 } // 기본값: 중앙
  const trimOffset = assetMeta?.trimOffset || { x: 0, y: 0 }

  // 아이템 렌더 크기 (스케일 포함, 정밀도 유지)
  const w = intrinsicW * (item.scale || 1) * transform.scale
  const h = intrinsicH * (item.scale || 1) * transform.scale

  // 기준점 좌표 (정밀도 유지)
  let x = transform.offsetX + xBase * transform.scale
  let y = transform.offsetY + yBase * transform.scale

  // 핫스팟 기반 앵커 보정 (더 정확한 위치 계산)
  const hotspotOffsetX = (hotspot.x - 0.5) * w
  const hotspotOffsetY = (hotspot.y - 0.5) * h
  const trimOffsetX = trimOffset.x * transform.scale
  const trimOffsetY = trimOffset.y * transform.scale

  // 앵커 보정 + 핫스팟 보정
  switch (item.anchor) {
    case 'top-right':
      x = x - w + hotspotOffsetX - trimOffsetX
      y = y + hotspotOffsetY - trimOffsetY
      break
    case 'bottom-left':
      x = x + hotspotOffsetX - trimOffsetX
      y = y - h + hotspotOffsetY - trimOffsetY
      break
    case 'bottom-right':
      x = x - w + hotspotOffsetX - trimOffsetX
      y = y - h + hotspotOffsetY - trimOffsetY
      break
    case 'center':
      x = x - w / 2 + hotspotOffsetX - trimOffsetX
      y = y - h / 2 + hotspotOffsetY - trimOffsetY
      break
    case 'top-left':
      x = x + hotspotOffsetX - trimOffsetX
      y = y + hotspotOffsetY - trimOffsetY
      break
  }

  // 서브픽셀 정밀도 유지 (transform: translate3d 사용)
  return { 
    x: Math.round(x * 1000) / 1000, // 0.001px 정밀도
    y: Math.round(y * 1000) / 1000, 
    w: Math.round(w * 1000) / 1000, 
    h: Math.round(h * 1000) / 1000 
  }
}

// 픽셀 좌표를 정규화 좌표로 변환 (드래그 시 사용, hotspot 고려)
function toNormalized(
  pxX: number,
  pxY: number,
  containerRect: DOMRect,
  viewScale: number,
  viewOffsetX: number,
  viewOffsetY: number,
  anchor: Anchor,
  renderW: number,
  renderH: number,
  hotspot: { x: number; y: number } = { x: 0.5, y: 0.5 },
  trimOffset: { x: number; y: number } = { x: 0, y: 0 }
): { nx: number; ny: number } {
  let x = pxX
  let y = pxY

  // 핫스팟과 트림 오프셋 보정
  const hotspotOffsetX = (hotspot.x - 0.5) * renderW
  const hotspotOffsetY = (hotspot.y - 0.5) * renderH
  const trimOffsetX = trimOffset.x * viewScale
  const trimOffsetY = trimOffset.y * viewScale

  // 앵커 반대로 되돌리기 + 핫스팟 보정
  switch (anchor) {
    case 'top-right':
      x = x + renderW - hotspotOffsetX + trimOffsetX
      y = y - hotspotOffsetY + trimOffsetY
      break
    case 'bottom-left':
      x = x - hotspotOffsetX + trimOffsetX
      y = y + renderH - hotspotOffsetY + trimOffsetY
      break
    case 'bottom-right':
      x = x + renderW - hotspotOffsetX + trimOffsetX
      y = y + renderH - hotspotOffsetY + trimOffsetY
      break
    case 'center':
      x = x + renderW / 2 - hotspotOffsetX + trimOffsetX
      y = y + renderH / 2 - hotspotOffsetY + trimOffsetY
      break
    case 'top-left':
      x = x - hotspotOffsetX + trimOffsetX
      y = y - hotspotOffsetY + trimOffsetY
      break
  }

  const baseX = (x - viewOffsetX) / viewScale
  const baseY = (y - viewOffsetY) / viewScale
  return { 
    nx: Math.round((baseX / BASE_W) * 1000000) / 1000000, // 6자리 정밀도
    ny: Math.round((baseY / BASE_H) * 1000000) / 1000000 
  }
}

// ===========================
// 코디 아이템 설정 (위치, 크기, 레이어)
// ===========================

// 카테고리별 이미지 크기 설정 (px 단위)
const ITEM_SIZES: Record<Major, { width: number; height: number }> = {
  // 의류 아이템들 (큰 크기)
  top: { width: 110, height: 110 },        // 상의: 기본 크기
  outer: { width: 220, height: 220 },   // 아우터: 상의보다 약간 큼
  bottom: { width: 200, height: 200 },       // 하의: 가로는 좁고 세로는 길게
  dresses: { width: 200, height: 280 },     // 원피스: 전체 의상이므로 세로로 길게
  shoes: { width: 130, height: 90 },       // 신발: 가로로 넓고 세로는 낮게
  
  // 액세서리 아이템들 (중간 크기)
  bag: { width: 120, height: 150 },        // 가방: 세로로 길게
  hat: { width: 80, height: 80 },         // 모자: 가로로 넓게
  glasses: { width: 80, height: 60 },       // 선글라스: 작고 가로로 넓게
  watch: { width: 60, height: 60 },         // 시계: 작은 정사각형
  belt: { width: 100, height: 40 },         // 벨트: 가로로 매우 길게
  socks: { width: 80, height: 120 },        // 양말: 세로로 길게
  
  // 주얼리 아이템들 (작은 크기)
  jewelry: { width: 60, height: 60 },       // 주얼리: 작은 정사각형
  accessory: { width: 80, height: 80 },   // 기타 액세서리: 작은 정사각형
  ring: { width: 40, height: 40 },         // 반지: 매우 작은 정사각형
  bracelet: { width: 50, height: 50 },     // 팔찌: 작은 정사각형
  necklace: { width: 60, height: 60 },     // 목걸이: 작은 정사각형
}

// 상세한 코디 배치 규칙에 따른 ANCHOR 설정 (정규화 좌표와 앵커)
const ANCHOR: Record<Major, { nx: number; ny: number; z: number; anchor: Anchor }> = {
  // 상의: 점선 마네킹의 상반신에 위치 (중앙 기준)
  top: { nx: 0.5, ny: 0.30, z: 30, anchor: 'center' },
  
  // 아우터: 상의 위치를 대체하고, 상의는 아우터 오른쪽으로 이동 (z-index 높음)
  outer: { nx: 0.5, ny: 0.25, z: 40, anchor: 'center' },
  
  // 하의: 상의 하단에 위치 (중앙 기준)
  bottom: { nx: 0.5, ny: 0.65, z: 20, anchor: 'center' },
  
  // 신발: 하의 하단에 위치 (중앙 기준)
  shoes: { nx: 0.5, ny: 0.90, z: 10, anchor: 'center' },
  
  // 가방: 점선 마네킹 상반신의 좌측에 위치 (중앙 기준)
  bag: { nx: 0.25, ny: 0.35, z: 50, anchor: 'center' },
  
  // 액세서리: 가방 하단에 위치 (중앙 기준)
  accessory: { nx: 0.25, ny: 0.55, z: 60, anchor: 'center' },
  
  // 원피스: 상의와 하의를 대체하는 전체 의상 (중앙 기준)
  dresses: { nx: 0.5, ny: 0.4, z: 25, anchor: 'center' },
  
  // 모자와 머플러: 점선 마네킹 상반신 위에 위치 (중앙 기준)
  hat: { nx: 0.5, ny: 0.1, z: 70, anchor: 'center' },
  
  // 선글라스/안경테: 모자 위치의 좌측에 위치 (중앙 기준)
  glasses: { nx: 0.35, ny: 0.1, z: 75, anchor: 'center' },
  
  // 주얼리: 모자와 머플러 좌측에 위치 (중앙 기준)
  jewelry: { nx: 0.35, ny: 0.15, z: 80, anchor: 'center' },
  
  // 시계와 벨트: 점선 마네킹 하반신 좌측에 위치 (중앙 기준)
  watch: { nx: 0.25, ny: 0.6, z: 65, anchor: 'center' },
  belt: { nx: 0.25, ny: 0.5, z: 35, anchor: 'center' },
  
  // 양말/레그웨어: 신발 좌측에 위치 (중앙 기준)
  socks: { nx: 0.25, ny: 0.75, z: 15, anchor: 'center' },
  
  // 주얼리 아이템들
  ring: { nx: 0.35, ny: 0.5, z: 85, anchor: 'center' },
  bracelet: { nx: 0.35, ny: 0.45, z: 85, anchor: 'center' },
  necklace: { nx: 0.5, ny: 0.2, z: 85, anchor: 'center' },
}

function cn(...c: (string | false | null | undefined)[]) { return c.filter(Boolean).join(" ") }

// ===========================
// 안정된 렌더링을 위한 훅
// ===========================

// 안정된 컨테이너 크기를 감지하는 훅 (개선된 버전)
function useStableRect(ref: React.RefObject<HTMLElement | null>, stableFrames = 3) {
  const [rect, setRect] = React.useState<DOMRect | null>(null)
  const framesStable = React.useRef(0)
  const lastStableRect = React.useRef<DOMRect | null>(null)
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (!ref.current) return
    const el = ref.current

    // 디바운스된 업데이트 함수 (16-32ms)
    const debouncedUpdate = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      debounceTimer.current = setTimeout(() => {
        requestAnimationFrame(update)
      }, 16) // 16ms 디바운스
    }

    const update = () => {
      const r = el.getBoundingClientRect()
      const prev = lastStableRect.current
      
      // 더 엄격한 안정성 검사 (0.1px 이하 변화)
      const isSame =
        prev &&
        Math.abs(prev.width - r.width) < 0.1 &&
        Math.abs(prev.height - r.height) < 0.1 &&
        Math.abs(prev.x - r.x) < 0.1 &&
        Math.abs(prev.y - r.y) < 0.1

      if (isSame) {
        framesStable.current += 1
      } else {
        framesStable.current = 0
        lastStableRect.current = r
      }
      
      // 연속 2-3프레임 동일할 때만 안정으로 간주
      if (framesStable.current >= stableFrames) {
        setRect(r)
        framesStable.current = 0 // 리셋
      } else {
        requestAnimationFrame(update)
      }
    }

    // ResizeObserver로 크기 변화 감지
    const ro = new ResizeObserver(debouncedUpdate)
    ro.observe(el)

    // visualViewport로 모바일 주소창 변화 감지
    const vv = (window as any).visualViewport as VisualViewport | undefined
    const onVV = debouncedUpdate
    if (vv) {
      vv.addEventListener('resize', onVV, { passive: true })
      vv.addEventListener('scroll', onVV, { passive: true })
    }

    // 윈도우 리사이즈 감지
    const onWindowResize = debouncedUpdate
    window.addEventListener('resize', onWindowResize, { passive: true })

    // 초기 안정화 체크 (이미지/폰트 로딩 완료 후)
    const initialCheck = () => {
      // 이미지 로딩 완료 대기
      const images = el.querySelectorAll('img')
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve()
        return new Promise(resolve => {
          img.onload = resolve
          img.onerror = resolve
        })
      })
      
      Promise.all(imagePromises).then(() => {
        // 폰트 로딩 완료 대기
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            requestAnimationFrame(update)
          })
        } else {
          requestAnimationFrame(update)
        }
      })
    }

    // 초기 체크 실행
    initialCheck()

    return () => {
      ro.disconnect()
      if (vv) {
        vv.removeEventListener('resize', onVV)
        vv.removeEventListener('scroll', onVV)
      }
      window.removeEventListener('resize', onWindowResize)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [ref.current, stableFrames])

  return rect
}

// ===========================
// MINIMAL UI
// ===========================
export function NewCodyPlayground() {
  const [placed, setPlaced] = useState<PlacedItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const active = useMemo(() => placed.find(p => p.id === activeId) || null, [placed, activeId])

  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedGender, setSelectedGender] = useState<Gender>("all")
  const [selectedMainCategory, setSelectedMainCategory] = useState<Major | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const [targetSlot, setTargetSlot] = useState<Major | null>(null)

  // 캔버스 참조와 안정된 크기
  const canvasRef = useRef<HTMLDivElement>(null)
  const stableRect = useStableRect(canvasRef, 3)
  
  // 뷰 변환 계산
  const viewTransform = useMemo(() => {
    if (!stableRect) return null
    return buildViewTransform(stableRect.width, stableRect.height)
  }, [stableRect])

  // 레거시 좌표를 정규화 좌표로 변환하는 함수 (개선된 마이그레이션)
  const migrateLegacyItem = (item: any): PlacedItem => {
    // 이미 정규화 좌표가 있으면 그대로 사용
    if (item.nx !== undefined && item.ny !== undefined) {
      // 자산 메타데이터가 없으면 생성
      const assetMeta = item.assetMeta || AssetMetaManager.getDefaultAssetMeta(
        item.src || '/placeholder.svg',
        ITEM_SIZES[item.slot as Major]?.width || 100,
        ITEM_SIZES[item.slot as Major]?.height || 100
      );
      
      // 카테고리별 핫스팟 적용
      if (!assetMeta.hotspot || assetMeta.hotspot.x === 0.5 && assetMeta.hotspot.y === 0.5) {
        assetMeta.hotspot = AssetMetaManager.getCategoryHotspot(item.slot as Major);
      }
      
      return {
        ...item,
        stateVersion: item.stateVersion || 2, // 최신 버전으로 업데이트
        slot: item.slot || item.type || 'accessory',
        assetMeta,
      } as PlacedItem
    }
    
    // 레거시 px 좌표를 정규화 좌표로 변환
    const basePosition = ANCHOR[item.slot as Major] || { nx: 0.5, ny: 0.5, z: 10, anchor: 'center' }
    
    // px 좌표가 있으면 정규화 좌표로 변환
    let nx = basePosition.nx;
    let ny = basePosition.ny;
    
    if (item.x !== undefined && item.y !== undefined) {
      // 현재 뷰 변환을 사용하여 px를 정규화 좌표로 변환
      if (viewTransform) {
        const normalized = toNormalized(
          item.x,
          item.y,
          { width: viewTransform.containerW, height: viewTransform.containerH } as DOMRect,
          viewTransform.scale,
          viewTransform.offsetX,
          viewTransform.offsetY,
          item.anchor || basePosition.anchor,
          ITEM_SIZES[item.slot as Major]?.width || 100,
          ITEM_SIZES[item.slot as Major]?.height || 100
        );
        nx = normalized.nx;
        ny = normalized.ny;
      }
    }
    
    // 자산 메타데이터 생성
    const assetMeta = AssetMetaManager.getDefaultAssetMeta(
      item.src || '/placeholder.svg',
      ITEM_SIZES[item.slot as Major]?.width || 100,
      ITEM_SIZES[item.slot as Major]?.height || 100
    );
    
    // 카테고리별 핫스팟 적용
    assetMeta.hotspot = AssetMetaManager.getCategoryHotspot(item.slot as Major);
    
    // 안전한 slot 설정
    const safeSlot = item.slot || item.type || 'accessory';
    
    return {
      ...item,
      nx,
      ny,
      anchor: item.anchor || basePosition.anchor,
      slot: safeSlot,
      assetMeta,
      stateVersion: 2, // 마이그레이션된 아이템은 최신 버전
      // 레거시 좌표는 제거하지 않고 보존 (하위 호환성)
      x: item.x,
      y: item.y,
    }
  }

  // 클라이언트에서만 localStorage에서 데이터 로드
  React.useEffect(() => {
    setIsClient(true)
    setIsHydrated(true)
    
    const savedCody = localStorage.getItem('cody-playground-items')
    if (savedCody) {
      try {
        const parsedData = JSON.parse(savedCody)
        
        // 새로운 형식인지 확인 (metadata가 있는지)
        if (parsedData.items && parsedData.metadata) {
          const migratedItems = parsedData.items.map(migrateLegacyItem)
          setPlaced(migratedItems)
          console.log('상세한 코디 데이터 로드 (마이그레이션 완료):', migratedItems)
          console.log(`총 ${parsedData.metadata.totalItems}개 아이템, 사용자 정의 위치 ${parsedData.metadata.customPositions}개`)
        } else {
          // 기존 형식 (배열) - 하위 호환성
          const migratedItems = parsedData.map(migrateLegacyItem)
          setPlaced(migratedItems)
          console.log('기존 형식 코디 데이터 로드 (마이그레이션 완료):', migratedItems)
        }
      } catch (error) {
        console.error('초기 코디 데이터 로드 실패:', error)
      }
    }
  }, [])

  // 코디 상태가 변경될 때마다 localStorage에 저장 (클라이언트에서만)
  React.useEffect(() => {
    if (isClient) {
      const detailedData = {
        items: placed,
        metadata: {
          savedAt: Date.now(),
          version: '1.0',
          totalItems: placed.length,
          customPositions: placed.filter(item => item.metadata?.isCustomPosition).length,
          lastModified: Math.max(...placed.map(item => item.lastModified || 0))
        }
      }
      
      localStorage.setItem('cody-playground-items', JSON.stringify(detailedData))
      console.log('상세한 코디 상태 저장:', detailedData)
    }
  }, [placed, isClient])

  const currentGenderCategory = CATEGORIES.find(cat => cat.id === selectedGender)
  const currentMainCategory = currentGenderCategory?.mainCategories.find(cat => cat.id === selectedMainCategory)




  const removeActive = () => { if (!active) return; setPlaced(prev => prev.filter(p => p.id !== active.id)); setActiveId(null) }

  // 전체 코디 초기화 함수
  const clearAllCody = () => {
    if (confirm('정말로 모든 코디를 초기화하시겠습니까?')) {
      setPlaced([])
      setActiveId(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cody-playground-items')
      }
      console.log('전체 코디 초기화 완료')
    }
  }

  const handleCategorySelect = (genderId: string, mainCategoryId: string, subCategoryId?: string) => {
    setSelectedGender(genderId as Gender)
    setSelectedMainCategory(mainCategoryId as Major)
    if (subCategoryId) {
      setSelectedSubCategory(subCategoryId)
    } else {
      setSelectedSubCategory(null)
    }
  }

  return (
    <div 
      className="w-full min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
      style={{
        // 레이아웃 가드: 부모 transform 금지
        transform: 'none',
        // 스크롤 격리: 페이지 스크롤 차단
        overflow: 'hidden',
        // 폰트 로딩 영향 차단
        // fontDisplay: 'block', // CSS 속성이므로 제거
        // 부모 요소의 transform/zoom 영향 차단
        isolation: 'isolate'
      }}
    >
      {/* App bar - 오버레이 레이어 */}
      <div 
        className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-2"
        style={{
          // 오버레이로 떠있게 하여 캔버스 레이아웃에 영향 없음
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          // 부모 transform 영향 차단
          transform: 'translateZ(0)',
          // 폰트 로딩 영향 차단
          // fontDisplay: 'block' // CSS 속성이므로 제거
        }}
      >
        <Button variant="ghost" size="icon" aria-label="뒤로가기"><ArrowLeft className="h-5 w-5 text-gray-700 dark:text-dark-text"/></Button>
      <div className="text-sm text-gray-700 dark:text-dark-text">
        Playground {isHydrated && placed.length > 0 && `(${placed.length}개 아이템)`}
      </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={clearAllCody}
            disabled={!isHydrated || placed.length === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4"/>
            전체 초기화
          </Button>
          <Button className="rounded-lg h-8 px-3 bg-gray-900 dark:bg-dark-accent text-white hover:bg-gray-800 dark:hover:bg-[#2FB88A]">
            <Save className="mr-2 h-4 w-4"/>저장
          </Button>
        </div>
      </div>

      {/* Canvas - 전체 화면 코디 영역 */}
      <div 
        ref={canvasRef}
        className="relative w-full bg-gray-50 dark:bg-dark-sub"
        style={{ 
          backgroundImage: 'url(/배경.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          // 가상 캔버스 비율 고정 (letterboxing 적용)
          aspectRatio: `${BASE_W}/${BASE_H}`,
          // 100dvh 사용 (모바일 주소창 변화 대응)
          height: '100dvh',
          // 고정 헤더와 겹치지 않도록 상단 패딩
          paddingTop: '60px', // 헤더 높이만큼 패딩
          // 오버플로우 숨김으로 letterboxing 효과
          overflow: 'hidden',
          // 레이아웃 격리를 위한 독립 레이어
          isolation: 'isolate',
          // 부모 transform 영향 차단
          transform: 'translateZ(0)',
          // 폰트 로딩 영향 차단
          // fontDisplay: 'block', // CSS 속성이므로 제거
          // 스크롤 격리: 내부 스크롤만 허용
          overscrollBehavior: 'contain'
        }}
      >
        {/* Items - 안정된 크기와 하이드레이션 완료 후에만 렌더링 */}
        {isHydrated && viewTransform && placed
          .slice()
          .sort((a, b) => a.z - b.z)
          .map(p => (
            <DraggableItem 
              key={p.id} 
              data={p} 
              active={p.id===activeId} 
              onActivate={() => setActiveId(p.id)} 
              onChange={(patch) => setPlaced(prev => prev.map(x => x.id===p.id? { ...x, ...patch } : x))} 
              onRemove={removeActive}
              viewTransform={viewTransform}
            />
          ))}

        {/* 카테고리 버튼 - 우측 하단 */}
        <div className="absolute bottom-4 right-4">
          <CodyCategoryChips
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedGender={selectedGender}
            selectedMainCategory={selectedMainCategory || undefined}
            selectedSubCategory={selectedSubCategory || undefined}
            onCategorySelect={handleCategorySelect}
            onProductAdd={(product) => {
              // 상품을 마네킹에 추가하는 로직
              console.log('상품 추가 시도:', product, 'selectedMainCategory:', selectedMainCategory);
              
              // 상세한 카테고리 매핑 (상품명 기반 세부 분류)
              const getTypeFromCategory = (category: string, productName: string): Major => {
                const lowerName = productName.toLowerCase();
                
                switch (category) {
                  case '상의': return 'top';
                  case '아우터': return 'outer';
                  case '바지': return 'bottom';
                  case '신발': return 'shoes';
                  case '가방': return 'bag';
                  case '원피스/스커트': return 'dresses';
                  case '패션소품':
                    // 상품명을 기반으로 세부 분류
                    if (lowerName.includes('모자') || lowerName.includes('캡') || lowerName.includes('햇') || lowerName.includes('머플러')) {
                      return 'hat';
                    } else if (lowerName.includes('선글라스') || lowerName.includes('안경테') || lowerName.includes('안경')) {
                      return 'glasses';
                    } else if (lowerName.includes('반지')) {
                      return 'ring';
                    } else if (lowerName.includes('팔찌')) {
                      return 'bracelet';
                    } else if (lowerName.includes('목걸이') || lowerName.includes('네크리스') || lowerName.includes('귀걸이')) {
                      return 'necklace';
                    } else if (lowerName.includes('시계')) {
                      return 'watch';
                    } else if (lowerName.includes('벨트')) {
                      return 'belt';
                    } else if (lowerName.includes('양말') || lowerName.includes('레그웨어') || lowerName.includes('스타킹')) {
                      return 'socks';
                    } else {
                      return 'accessory';
                    }
                  default: return 'top';
                }
              };
              
              const slot = getTypeFromCategory(
                product.majorCategory || selectedMainCategory || '상의',
                product.productName || product.name || ''
              );
              
              const now = Date.now();
              const basePosition = ANCHOR[slot];
              const imageSrc = product.productImage || product.image || '/placeholder.svg';
              
              // 자산 메타데이터 생성 (비동기 로딩)
              const assetMeta = AssetMetaManager.getDefaultAssetMeta(
                imageSrc,
                ITEM_SIZES[slot].width,
                ITEM_SIZES[slot].height
              );
              
              // 카테고리별 핫스팟 적용
              assetMeta.hotspot = AssetMetaManager.getCategoryHotspot(slot);
              
              const newItem: PlacedItem = {
                id: `item-${now}-${Math.random()}`,
                itemId: product.productIdx?.toString() || product.id?.toString() || '',
                name: product.productName || product.name || '상품',
                src: imageSrc,
                slot: slot,
                // 정규화 좌표 사용
                nx: basePosition.nx,
                ny: basePosition.ny,
                anchor: basePosition.anchor,
                rotation: 0,
                z: basePosition.z,
                visible: true,
                // 자산 메타데이터
                assetMeta,
                // 상태 버전 (새 아이템은 최신 버전)
                stateVersion: 2,
                // 상세한 위치 정보 추가
                scale: 1.0,
                opacity: 1.0,
                lastModified: now,
                // 화면 크기별 위치 정보는 현재 사용하지 않음
                // 드래그 히스토리는 현재 사용하지 않음
                // 메타데이터 초기화
                metadata: {
                  isCustomPosition: false,
                  originalPosition: { nx: basePosition.nx, ny: basePosition.ny },
                  notes: '',
                  tags: []
                }
              };
              
              console.log('새 아이템 생성:', newItem);
              
              // 아우터와 상의의 특별한 배치 로직
              if (slot === 'outer') {
                // 아우터 추가 시 기존 상의를 오른쪽으로 이동
                setPlaced(prev => {
                  const updated = prev.map(item => {
                    if (item.slot === 'top') {
                      return { 
                        ...item, 
                        nx: 0.7, 
                        ny: item.ny, // y 좌표는 유지
                        z: 25,
                        metadata: {
                          ...item.metadata,
                          isCustomPosition: true
                        }
                      };
                    }
                    return item;
                  });
                  return [...updated, newItem];
                });
              } else if (slot === 'top') {
                // 상의 추가 시 아우터가 있으면 오른쪽에 배치
                setPlaced(prev => {
                  const hasOuterwear = prev.some(item => item.slot === 'outer');
                  if (hasOuterwear) {
                    newItem.nx = 0.7;
                    newItem.z = 25;
                    newItem.metadata = {
                      ...newItem.metadata,
                      isCustomPosition: true
                    };
                  }
                  return [...prev, newItem];
                });
              } else {
                // 다른 아이템들은 기본 위치에 배치
                setPlaced(prev => [...prev, newItem]);
              }
              
              setActiveId(newItem.id);
            }}
          />
        </div>
      </div>



    </div>
  )
}


// ===========================
// DRAG ITEM (정규화 좌표 시스템)
// ===========================
function DraggableItem({ data, active, onActivate, onChange, onRemove, viewTransform }: {
  data: PlacedItem;
  active: boolean;
  onActivate: () => void;
  onChange: (patch: Partial<PlacedItem>) => void;
  onRemove: () => void;
  viewTransform: ViewTransform | null;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; nx: number; ny: number } | null>(null);
  
  // 정규화 좌표를 픽셀 좌표로 변환 (안전한 접근)
  const safeSlot = data.slot || 'accessory'; // 기본값 설정
  const itemSize = ITEM_SIZES[safeSlot] || { width: 100, height: 100 };
  
  // viewTransform이 없으면 기본값 사용
  if (!viewTransform) {
    return null;
  }
  
  const pixelRect = computePixelRect(
    data, 
    viewTransform, 
    itemSize.width, 
    itemSize.height
  );

  // 드래그 시작 핸들러
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onActivate();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      nx: data.nx,
      ny: data.ny
    });
  };

  // 드래그 중 핸들러
  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !dragStart) return;
    
    e.preventDefault();
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // 픽셀 델타를 정규화 좌표로 변환 (computePixelRect의 역변환)
    const deltaNx = deltaX / (BASE_W * viewTransform.scale);
    const deltaNy = deltaY / (BASE_H * viewTransform.scale);
    
    const newNx = Math.max(0, Math.min(1, dragStart.nx + deltaNx));
    const newNy = Math.max(0, Math.min(1, dragStart.ny + deltaNy));
    
    onChange({
      nx: newNx,
      ny: newNy,
      lastModified: Date.now(),
      metadata: {
        ...data.metadata,
        isCustomPosition: true
      }
    });
  };

  // 드래그 종료 핸들러
  const handlePointerUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // 이벤트 리스너 등록/해제
  React.useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: PointerEvent) => handlePointerMove(e);
    const handleUp = () => handlePointerUp();

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);

    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, dragStart, viewTransform]);
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute select-none touch-none", 
        active && "outline outline-1 outline-gray-400 dark:outline-dark-accent",
        isDragging && "cursor-grabbing opacity-80"
      )}
      style={{ 
        left: 0,
        top: 0,
        transform: `translate3d(${pixelRect.x}px, ${pixelRect.y}px, 0) rotate(${data.rotation}deg)`, 
        zIndex: data.z, 
        display: data.visible ? undefined : "none",
        willChange: 'transform'
      }}
      onPointerDown={handlePointerDown}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={data.src} 
        alt={data.name} 
        className="object-contain" 
        style={{ 
          width: `${pixelRect.w}px`, 
          height: `${pixelRect.h}px`
        }}
      />
      
      
      {/* 하단 컨트롤 버튼들 */}
      {active && (
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-md bg-white dark:bg-dark-sub border border-gray-200 dark:border-dark-border px-1.5 py-1">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border" aria-label="회전" onClick={(e) => { 
            e.stopPropagation(); 
            const now = Date.now();
            onChange({ 
              rotation: (data.rotation + 15) % 360,
              lastModified: now,
              metadata: {
                ...data.metadata,
                isCustomPosition: true
              }
            }); 
          }}>
            <Move className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border" aria-label="삭제" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
