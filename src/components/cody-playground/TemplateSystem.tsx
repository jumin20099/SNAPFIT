'use client'

import React from 'react'
import { PlacedItem } from '@/entities/cody/model'

export const TEMPLATES = {
  flatlay: {
    name: '플랫레이',
    description: '평면 배치로 모든 아이템을 한눈에',
    icon: '📐'
  },
  lookbook: {
    name: '룩북',
    description: '상하의 세로 정렬로 스타일링',
    icon: '👔'
  },
  cluster: {
    name: '클러스터',
    description: '비대칭 집합으로 역동적인 구성',
    icon: '🎨'
  }
} as const

export type TemplateType = keyof typeof TEMPLATES

// 템플릿별 초기 배치 규칙
export function getTemplateLayout(
  template: TemplateType,
  items: PlacedItem[],
  canvasWidth: number,
  canvasHeight: number
): PlacedItem[] {
  const baseX = canvasWidth * 0.1 // 10% 마진
  const baseY = canvasHeight * 0.1 // 10% 마진
  const spacing = 16 // 16px 간격

  switch (template) {
    case 'flatlay':
      return getFlatlayLayout(items, baseX, baseY, spacing)
    
    case 'lookbook':
      return getLookbookLayout(items, baseX, baseY, canvasWidth, canvasHeight)
    
    case 'cluster':
      return getClusterLayout(items, baseX, baseY, canvasWidth, canvasHeight)
    
    default:
      return items
  }
}

function getFlatlayLayout(
  items: PlacedItem[], 
  baseX: number, 
  baseY: number, 
  spacing: number
): PlacedItem[] {
  const sortedItems = [...items].sort((a, b) => {
    // z-index 순서: 하의 → 신발 → 상의 → 아우터 → 액세서리
    const zOrder = { bottom: 10, shoes: 20, top: 30, outer: 40, accessory: 60 }
    return (zOrder[a.slot as keyof typeof zOrder] || 50) - (zOrder[b.slot as keyof typeof zOrder] || 50)
  })

  let currentX = baseX
  let currentY = baseY
  const itemsPerRow = 3
  let rowCount = 0

  return sortedItems.map((item, index) => {
    if (index > 0 && index % itemsPerRow === 0) {
      rowCount++
      currentX = baseX
      currentY = baseY + (rowCount * 200) + (rowCount * spacing)
    }

    const newItem = {
      ...item,
      nx: currentX / 1080, // BASE_W로 정규화
      ny: currentY / 1920, // BASE_H로 정규화
      scale: getTemplateScale(item.slot || 'accessory', 'flatlay'),
      z: getTemplateZ(item.slot || 'accessory')
    }

    currentX += 200 + spacing
    return newItem
  })
}

function getLookbookLayout(
  items: PlacedItem[],
  baseX: number,
  baseY: number,
  canvasWidth: number,
  canvasHeight: number
): PlacedItem[] {
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  return items.map(item => {
    let nx = item.nx
    let ny = item.ny
    let scale = getTemplateScale(item.slot || 'accessory', 'lookbook')

    // 상의/아우터는 중앙 상단
    if ((item.slot || 'accessory') === 'top' || (item.slot || 'accessory') === 'outer') {
      nx = (centerX - 100) / 1080
      ny = (centerY - 200) / 1920
    }
    // 하의는 중앙 하단
    else if ((item.slot || 'accessory') === 'bottom') {
      nx = (centerX - 100) / 1080
      ny = (centerY + 50) / 1920
    }
    // 신발은 하의 아래
    else if ((item.slot || 'accessory') === 'shoes') {
      nx = (centerX - 80) / 1080
      ny = (centerY + 200) / 1920
    }
    // 액세서리는 좌우 배치
    else if ((item.slot || 'accessory') === 'accessory' || (item.slot || 'accessory') === 'hat' || (item.slot || 'accessory') === 'glasses') {
      const isLeft = items.indexOf(item) % 2 === 0
      nx = (isLeft ? centerX - 200 : centerX + 50) / 1080
      ny = (centerY - 100) / 1920
    }

    return {
      ...item,
      nx,
      ny,
      scale,
      z: getTemplateZ(item.slot || 'accessory')
    }
  })
}

function getClusterLayout(
  items: PlacedItem[],
  baseX: number,
  baseY: number,
  canvasWidth: number,
  canvasHeight: number
): PlacedItem[] {
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  return items.map((item, index) => {
    // 비대칭 배치를 위한 각도 계산
    const angle = (index * 137.5) % 360 // 황금각 사용
    const radius = 150 + (index * 20) // 점진적 반경 증가
    const radians = (angle * Math.PI) / 180

    const offsetX = Math.cos(radians) * radius
    const offsetY = Math.sin(radians) * radius

    return {
      ...item,
      nx: (centerX + offsetX - 100) / 1080,
      ny: (centerY + offsetY - 100) / 1920,
      scale: getTemplateScale(item.slot || 'accessory', 'cluster'),
      z: getTemplateZ(item.slot || 'accessory') + index * 2, // 클러스터에서는 순서대로 z-index
      rotation: (angle + 45) % 360 // 약간의 회전 추가
    }
  })
}

// 템플릿별 스케일 규칙
function getTemplateScale(slot: string, template: TemplateType): number {
  const baseScales = {
    flatlay: { main: 1.0, sub: 0.92, accessory: 0.82 },
    lookbook: { main: 1.1, sub: 1.0, accessory: 0.9 },
    cluster: { main: 0.9, sub: 0.8, accessory: 0.7 }
  }

  const scales = baseScales[template]
  const mainSlots = ['top', 'outer', 'bottom', 'dresses']
  const subSlots = ['shoes', 'bag', 'hat']
  const accessorySlots = ['glasses', 'watch', 'belt', 'socks', 'jewelry', 'accessory', 'ring', 'bracelet', 'necklace']

  if (mainSlots.includes(slot)) return scales.main
  if (subSlots.includes(slot)) return scales.sub
  if (accessorySlots.includes(slot)) return scales.accessory
  return scales.main
}

// 템플릿별 z-index 규칙
function getTemplateZ(slot: string): number {
  const zOrder = {
    bottom: 10,
    shoes: 20,
    top: 30,
    outer: 40,
    bag: 50,
    hat: 55,
    glasses: 60,
    watch: 65,
    belt: 70,
    socks: 75,
    jewelry: 80,
    accessory: 85,
    ring: 90,
    bracelet: 95,
    necklace: 100
  }

  return zOrder[slot as keyof typeof zOrder] || 50
}

// 템플릿 선택 컴포넌트
interface TemplateSelectorProps {
  selectedTemplate: TemplateType | null
  onTemplateSelect: (template: TemplateType) => void
  onApplyTemplate: (template: TemplateType) => void
}

export function TemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  onApplyTemplate 
}: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text">
        레이아웃 템플릿
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(TEMPLATES).map(([key, template]) => (
          <button
            key={key}
            onClick={() => onTemplateSelect(key as TemplateType)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedTemplate === key
                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{template.icon}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-dark-text">
                  {template.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {template.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {selectedTemplate && (
        <button
          onClick={() => onApplyTemplate(selectedTemplate)}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          템플릿 적용
        </button>
      )}
    </div>
  )
}
