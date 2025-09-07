'use client'

import React, { useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Trash2, Move } from "lucide-react"
import { CATEGORIES, type GenderCategory, type MainCategory, type CategoryItem } from '@/constants/categories'
import { CategoryChips } from '@/components/ui/CategoryChips'

// ===========================
// TYPES & TAXONOMY (필수만)
// ===========================

type Gender = "all" | "male" | "female"
type Major = "shoes" | "tops" | "outerwear" | "pants" | "dresses" | "bags" | "accessories"


// 실제 API에서 데이터를 가져올 예정

type PlacedItem = {
  id: string
  itemId: string
  name: string
  src: string
  type: Major
  x: number
  y: number
  scale: number
  rotation: number
  z: number
  visible: boolean
}

const ANCHOR: Record<Major, { x: number; y: number; scale: number; z: number }> = {
  tops: { x: 0.5, y: 0.25, scale: 0.8, z: 30 },
  outerwear: { x: 0.5, y: 0.25, scale: 0.85, z: 40 },
  pants: { x: 0.5, y: 0.45, scale: 0.8, z: 20 },
  shoes: { x: 0.5, y: 0.75, scale: 0.7, z: 10 },
  bags: { x: 0.75, y: 0.35, scale: 0.6, z: 50 },
  accessories: { x: 0.5, y: 0.1, scale: 0.5, z: 60 },
  dresses: { x: 0.5, y: 0.4, scale: 0.9, z: 25 },
}

function cn(...c: (string | false | null | undefined)[]) { return c.filter(Boolean).join(" ") }

// ===========================
// MINIMAL UI
// ===========================
export function NewCodyPlayground() {
  const [placed, setPlaced] = useState<PlacedItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = useMemo(() => placed.find(p => p.id === activeId) || null, [placed, activeId])

  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedGender, setSelectedGender] = useState<Gender>("all")
  const [selectedMainCategory, setSelectedMainCategory] = useState<Major | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)

  const [targetSlot, setTargetSlot] = useState<Major | null>(null)

  const currentGenderCategory = CATEGORIES.find(cat => cat.id === selectedGender)
  const currentMainCategory = currentGenderCategory?.mainCategories.find(cat => cat.id === selectedMainCategory)




  const removeActive = () => { if (!active) return; setPlaced(prev => prev.filter(p => p.id !== active.id)); setActiveId(null) }

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
        <div className="text-sm text-gray-700 dark:text-dark-text">Playground</div>
        <Button className="rounded-lg h-8 px-3 bg-gray-900 dark:bg-dark-accent text-white hover:bg-gray-800 dark:hover:bg-[#2FB88A]">
          <Save className="mr-2 h-4 w-4"/>저장
        </Button>
      </div>

      {/* Canvas */}
      <div className="p-3">
        <div className="relative mx-auto w-full max-w-[400px] aspect-[5/7] rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-sub">
          {/* Mannequin */}
          <DottedMannequin onSelect={(slot) => { setTargetSlot(slot); setSelectedMainCategory(slot); setSelectedSubCategory(null); }} />

          {/* Items */}
          {placed
            .slice()
            .sort((a, b) => a.z - b.z)
            .map(p => (
              <DraggableItem key={p.id} data={p} active={p.id===activeId} onActivate={() => setActiveId(p.id)} onChange={(patch) => setPlaced(prev => prev.map(x => x.id===p.id? { ...x, ...patch } : x))} onRemove={removeActive} />
            ))}

        </div>
      </div>

      {/* Category Chips - 코디 페이지 모드 */}
      <CategoryChips
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedGender={selectedGender}
        selectedMainCategory={selectedMainCategory || undefined}
        selectedSubCategory={selectedSubCategory || undefined}
        onCategorySelect={handleCategorySelect}
        onProductAdd={(product) => {
          // 상품을 마네킹에 추가하는 로직
          console.log('상품 추가:', product)
        }}
        mode="cody"
      />


    </div>
  )
}

// ===========================
// DOTTED MANNEQUIN (모바일 최적화 + 팔다리)
// ===========================
function DottedMannequin({ onSelect }: { onSelect: (slot: Major) => void }) {
  return (
    <svg className="absolute inset-0" viewBox="0 0 200 280" role="img" aria-label="점선 마네킹">
      <g stroke="#d1d5db" strokeDasharray="3 4" fill="none" strokeWidth="1.5" className="dark:stroke-dark-border">
        {/* 머리 */}
        <circle cx="100" cy="25" r="18" />
        
        {/* 목 */}
        <line x1="100" y1="43" x2="100" y2="50" />
        
        {/* 몸통 */}
        <rect x="75" y="50" width="50" height="80" rx="12" />
        
        {/* 팔 (왼쪽) */}
        <rect x="60" y="55" width="20" height="70" rx="8" />
        
        {/* 팔 (오른쪽) */}
        <rect x="120" y="55" width="20" height="70" rx="8" />
        
        {/* 다리 (왼쪽) */}
        <rect x="80" y="130" width="18" height="75" rx="6" />
        
        {/* 다리 (오른쪽) */}
        <rect x="102" y="130" width="18" height="75" rx="6" />
        
        {/* 발 (왼쪽) */}
        <rect x="78" y="200" width="22" height="12" rx="4" />
        
        {/* 발 (오른쪽) */}
        <rect x="100" y="200" width="22" height="12" rx="4" />
      </g>
      
      {/* 클릭 가능한 영역 */}
      <g className="cursor-pointer">
        {/* 머리/액세서리 */}
        <rect x="82" y="7" width="36" height="36" fill="transparent" onClick={() => onSelect("accessories")} />
        
        {/* 상의 */}
        <rect x="75" y="50" width="50" height="40" fill="transparent" onClick={() => onSelect("tops")} />
        
        {/* 아우터 */}
        <rect x="70" y="45" width="60" height="50" fill="transparent" onClick={() => onSelect("outerwear")} />
        
        {/* 하의 */}
        <rect x="75" y="90" width="50" height="40" fill="transparent" onClick={() => onSelect("pants")} />
        
        {/* 원피스/스커트 */}
        <rect x="75" y="50" width="50" height="80" fill="transparent" onClick={() => onSelect("dresses")} />
        
        {/* 신발 */}
        <rect x="75" y="195" width="50" height="20" fill="transparent" onClick={() => onSelect("shoes")} />
        
        {/* 가방 (오른쪽 어깨) */}
        <rect x="125" y="60" width="30" height="45" fill="transparent" onClick={() => onSelect("bags")} />
      </g>
    </svg>
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
  return (
    <motion.div
      ref={ref}
      className={cn("absolute select-none touch-none", active && "outline outline-1 outline-gray-400 dark:outline-dark-accent")}
      style={{ left: `${data.x * 100}%`, top: `${data.y * 100}%`, transform: `translate(-50%, -50%) rotate(${data.rotation}deg) scale(${data.scale})`, zIndex: data.z, display: data.visible ? undefined : "none" }}
      onPointerDown={onActivate}
      drag dragMomentum={false} dragElastic={0}
      onDrag={(e, info) => {
        const parent = ref.current?.parentElement?.getBoundingClientRect(); if (!parent) return;
        const cx = (data.x * parent.width + info.delta.x) / parent.width;
        const cy = (data.y * parent.height + info.delta.y) / parent.height;
        onChange({ x: Math.min(0.98, Math.max(0.02, cx)), y: Math.min(0.98, Math.max(0.02, cy)) });
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={data.src} alt={data.name} className="h-32 w-auto" />
      {active && (
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-md bg-white dark:bg-dark-sub border border-gray-200 dark:border-dark-border px-1.5 py-1">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border" aria-label="회전" onClick={(e) => { e.stopPropagation(); onChange({ rotation: (data.rotation + 15) % 360 }); }}>
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
