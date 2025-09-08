'use client'

import React, { useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Trash2, Move, RotateCcw } from "lucide-react"
import { CATEGORIES, type GenderCategory, type MainCategory, type CategoryItem } from '@/constants/categories'
import { CodyCategoryChips } from '@/components/ui/CodyCategoryChips'

// ===========================
// TYPES & TAXONOMY (필수만)
// ===========================

type Gender = "all" | "male" | "female"
type Major = "shoes" | "tops" | "outerwear" | "pants" | "dresses" | "bags" | "accessories" | "hat" | "glasses" | "jewelry" | "watch" | "belt" | "socks"


// 실제 API에서 데이터를 가져올 예정

type PlacedItem = {
  id: string
  itemId: string
  name: string
  src: string
  type: Major
  x: number
  y: number
  rotation: number
  z: number
  visible: boolean
  // 상세한 위치 정보 추가
  scale?: number
  opacity?: number
  lastModified?: number
  // 화면 크기별 위치 정보 (반응형 대응)
  positions?: {
    mobile?: { x: number; y: number }
    tablet?: { x: number; y: number }
    desktop?: { x: number; y: number }
  }
  // 드래그 히스토리 (최근 10개 위치)
  positionHistory?: Array<{
    x: number
    y: number
    timestamp: number
  }>
  // 사용자 정의 메타데이터
  metadata?: {
    isCustomPosition?: boolean
    originalPosition?: { x: number; y: number }
    notes?: string
    tags?: string[]
  }
}

// ===========================
// 코디 아이템 설정 (위치, 크기, 레이어)
// ===========================

// 카테고리별 이미지 크기 설정 (px 단위)
const ITEM_SIZES: Record<Major, { width: number; height: number }> = {
  // 의류 아이템들 (큰 크기)
  tops: { width: 110, height: 110 },        // 상의: 기본 크기
  outerwear: { width: 220, height: 220 },   // 아우터: 상의보다 약간 큼
  pants: { width: 200, height: 200 },       // 하의: 가로는 좁고 세로는 길게
  dresses: { width: 200, height: 280 },     // 원피스: 전체 의상이므로 세로로 길게
  shoes: { width: 130, height: 90 },       // 신발: 가로로 넓고 세로는 낮게
  
  // 액세서리 아이템들 (중간 크기)
  bags: { width: 120, height: 150 },        // 가방: 세로로 길게
  hat: { width: 80, height: 80 },         // 모자: 가로로 넓게
  glasses: { width: 80, height: 60 },       // 선글라스: 작고 가로로 넓게
  watch: { width: 60, height: 60 },         // 시계: 작은 정사각형
  belt: { width: 100, height: 40 },         // 벨트: 가로로 매우 길게
  socks: { width: 80, height: 120 },        // 양말: 세로로 길게
  
  // 주얼리 아이템들 (작은 크기)
  jewelry: { width: 60, height: 60 },       // 주얼리: 작은 정사각형
  accessories: { width: 80, height: 80 },   // 기타 액세서리: 작은 정사각형
}

// 상세한 코디 배치 규칙에 따른 ANCHOR 설정 (위치와 레이어)
const ANCHOR: Record<Major, { x: number; y: number; z: number }> = {
  // 상의: 점선 마네킹의 상반신에 위치
  tops: { x: 0.5, y: 0.30, z: 30 },
  
  // 아우터: 상의 위치를 대체하고, 상의는 아우터 오른쪽으로 이동 (z-index 높음)
  outerwear: { x: 0.5, y: 0.25, z: 40 },
  
  // 하의: 상의 하단에 위치
  pants: { x: 0.5, y: 0.65, z: 20 },
  
  // 신발: 하의 하단에 위치
  shoes: { x: 0.5, y: 0.90, z: 10 },
  
  // 가방: 점선 마네킹 상반신의 좌측에 위치
  bags: { x: 0.25, y: 0.35, z: 50 },
  
  // 액세서리: 가방 하단에 위치 (기본 액세서리)
  accessories: { x: 0.25, y: 0.55, z: 60 },
  
  // 원피스: 상의와 하의를 대체하는 전체 의상
  dresses: { x: 0.5, y: 0.4, z: 25 },
  
  // 모자와 머플러: 점선 마네킹 상반신 위에 위치
  hat: { x: 0.5, y: 0.1, z: 70 },
  
  // 선글라스/안경테: 모자 위치의 좌측에 위치
  glasses: { x: 0.35, y: 0.1, z: 75 },
  
  // 주얼리: 모자와 머플러 좌측에 위치
  jewelry: { x: 0.35, y: 0.15, z: 80 },
  
  // 시계와 벨트: 점선 마네킹 하반신 좌측에 위치
  watch: { x: 0.25, y: 0.6, z: 65 },
  belt: { x: 0.25, y: 0.5, z: 35 },
  
  // 양말/레그웨어: 신발 좌측에 위치
  socks: { x: 0.25, y: 0.75, z: 15 },
}

function cn(...c: (string | false | null | undefined)[]) { return c.filter(Boolean).join(" ") }

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
          setPlaced(parsedData.items)
          console.log('상세한 코디 데이터 로드:', parsedData)
          console.log(`총 ${parsedData.metadata.totalItems}개 아이템, 사용자 정의 위치 ${parsedData.metadata.customPositions}개`)
        } else {
          // 기존 형식 (배열) - 하위 호환성
          setPlaced(parsedData)
          console.log('기존 형식 코디 데이터 로드:', parsedData)
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
    <div className="w-full min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      {/* App bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-2">
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
      <div className="relative w-full h-[calc(100vh-100px)] bg-gray-50 dark:bg-dark-sub"
           style={{ 
             backgroundImage: 'url(/배경.jpg)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }}>

        {/* Items - 하이드레이션 완료 후에만 렌더링 */}
        {isHydrated && placed
          .slice()
          .sort((a, b) => a.z - b.z)
          .map(p => (
            <DraggableItem key={p.id} data={p} active={p.id===activeId} onActivate={() => setActiveId(p.id)} onChange={(patch) => setPlaced(prev => prev.map(x => x.id===p.id? { ...x, ...patch } : x))} onRemove={removeActive} />
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
              const getTypeFromCategory = (category: string, productName: string) => {
                const lowerName = productName.toLowerCase();
                
                switch (category) {
                  case '상의': return 'tops';
                  case '아우터': return 'outerwear';
                  case '바지': return 'pants';
                  case '신발': return 'shoes';
                  case '가방': return 'bags';
                  case '원피스/스커트': return 'dresses';
                  case '패션소품':
                    // 상품명을 기반으로 세부 분류
                    if (lowerName.includes('모자') || lowerName.includes('캡') || lowerName.includes('햇') || lowerName.includes('머플러')) {
                      return 'hat';
                    } else if (lowerName.includes('선글라스') || lowerName.includes('안경테') || lowerName.includes('안경')) {
                      return 'glasses';
                    } else if (lowerName.includes('목걸이') || lowerName.includes('네크리스') || lowerName.includes('귀걸이') || lowerName.includes('반지') || lowerName.includes('팔찌')) {
                      return 'jewelry';
                    } else if (lowerName.includes('시계')) {
                      return 'watch';
                    } else if (lowerName.includes('벨트')) {
                      return 'belt';
                    } else if (lowerName.includes('양말') || lowerName.includes('레그웨어') || lowerName.includes('스타킹')) {
                      return 'socks';
                    } else {
                      return 'accessories';
                    }
                  default: return 'tops';
                }
              };
              
              const itemType = getTypeFromCategory(
                product.majorCategory || selectedMainCategory || '상의',
                product.productName || product.name || ''
              );
              
              const now = Date.now();
              const basePosition = ANCHOR[itemType as Major];
              
              const newItem: PlacedItem = {
                id: `item-${now}-${Math.random()}`,
                itemId: product.productIdx?.toString() || product.id?.toString() || '',
                name: product.productName || product.name || '상품',
                src: product.productImage || product.image || '/placeholder.svg',
                type: itemType as Major,
                x: basePosition.x,
                y: basePosition.y,
                rotation: 0,
                z: basePosition.z,
                visible: true,
                // 상세한 위치 정보 추가
                scale: 1.0,
                opacity: 1.0,
                lastModified: now,
                // 화면 크기별 위치 정보 (현재는 기본 위치로 설정)
                positions: {
                  mobile: { x: basePosition.x, y: basePosition.y },
                  tablet: { x: basePosition.x, y: basePosition.y },
                  desktop: { x: basePosition.x, y: basePosition.y }
                },
                // 드래그 히스토리 초기화
                positionHistory: [{
                  x: basePosition.x,
                  y: basePosition.y,
                  timestamp: now
                }],
                // 메타데이터 초기화
                metadata: {
                  isCustomPosition: false,
                  originalPosition: { x: basePosition.x, y: basePosition.y },
                  notes: '',
                  tags: []
                }
              };
              
              console.log('새 아이템 생성:', newItem);
              
              // 아우터와 상의의 특별한 배치 로직
              if (itemType === 'outerwear') {
                // 아우터 추가 시 기존 상의를 오른쪽으로 이동
                setPlaced(prev => {
                  const updated = prev.map(item => {
                    if (item.type === 'tops') {
                      return { ...item, x: 0.7, z: 25 };
                    }
                    return item;
                  });
                  return [...updated, newItem];
                });
              } else if (itemType === 'tops') {
                // 상의 추가 시 아우터가 있으면 오른쪽에 배치
                setPlaced(prev => {
                  const hasOuterwear = prev.some(item => item.type === 'outerwear');
                  if (hasOuterwear) {
                    newItem.x = 0.7;
                    newItem.z = 25;
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
// DRAG ITEM (필수 조작만: 회전, 삭제)
// ===========================
function DraggableItem({ data, active, onActivate, onChange, onRemove }: {
  data: PlacedItem;
  active: boolean;
  onActivate: () => void;
  onChange: (patch: Partial<PlacedItem>) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <motion.div
      ref={ref}
      className={cn("absolute select-none touch-none", active && "outline outline-1 outline-gray-400 dark:outline-dark-accent")}
      style={{ 
        left: `${data.x * 100}%`, 
        top: `${data.y * 100}%`, 
        transform: `translate(-50%, -50%) rotate(${data.rotation}deg)`, 
        zIndex: data.z, 
        display: data.visible ? undefined : "none" 
      }}
      onPointerDown={onActivate}
      drag={active}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onDrag={(e, info) => {
        const parent = ref.current?.parentElement?.getBoundingClientRect();
        if (!parent) return;
        
        const cx = (data.x * parent.width + info.delta.x) / parent.width;
        const cy = (data.y * parent.height + info.delta.y) / parent.height;
        
        const newX = Math.min(0.95, Math.max(0.05, cx));
        const newY = Math.min(0.95, Math.max(0.05, cy));
        const now = Date.now();
        
        // 상세한 위치 정보 업데이트
        const updateData: Partial<PlacedItem> = {
          x: newX,
          y: newY,
          lastModified: now,
          metadata: {
            ...data.metadata,
            isCustomPosition: true
          }
        };
        
        // 위치 히스토리 업데이트 (최근 10개만 유지)
        if (data.positionHistory) {
          const newHistory = [
            ...data.positionHistory.slice(-9), // 최근 9개 유지
            { x: newX, y: newY, timestamp: now }
          ];
          updateData.positionHistory = newHistory;
        }
        
        onChange(updateData);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={data.src} 
        alt={data.name} 
        className="object-contain" 
        style={{ 
          width: `${ITEM_SIZES[data.type].width}px`, 
          height: `${ITEM_SIZES[data.type].height}px`
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
    </motion.div>
  );
}
