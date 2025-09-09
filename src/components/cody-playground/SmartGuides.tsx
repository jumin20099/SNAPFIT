'use client'

import React, { useState, useEffect } from 'react'

interface GuideLine {
  id: string
  type: 'vertical' | 'horizontal'
  position: number
  color: string
  opacity: number
}

interface SmartGuidesProps {
  isVisible: boolean
  canvasRect: DOMRect | null
  items: Array<{ id: string; x: number; y: number; width: number; height: number }>
  activeItemId: string | null
}

export function SmartGuides({ isVisible, canvasRect, items, activeItemId }: SmartGuidesProps) {
  const [guides, setGuides] = useState<GuideLine[]>([])

  useEffect(() => {
    if (!isVisible || !canvasRect || !activeItemId) {
      setGuides([])
      return
    }

    const activeItem = items.find(item => item.id === activeItemId)
    if (!activeItem) {
      setGuides([])
      return
    }

    const newGuides: GuideLine[] = []
    const snapThreshold = 6 // 6px 이내에서 스냅

    // 중앙선 가이드
    const centerX = canvasRect.width / 2
    const centerY = canvasRect.height / 2
    
    if (Math.abs(activeItem.x + activeItem.width / 2 - centerX) < snapThreshold) {
      newGuides.push({
        id: 'center-x',
        type: 'vertical',
        position: centerX,
        color: '#3B82F6',
        opacity: 0.8
      })
    }

    if (Math.abs(activeItem.y + activeItem.height / 2 - centerY) < snapThreshold) {
      newGuides.push({
        id: 'center-y',
        type: 'horizontal',
        position: centerY,
        color: '#3B82F6',
        opacity: 0.8
      })
    }

    // 다른 아이템과의 정렬 가이드
    items.forEach(item => {
      if (item.id === activeItemId) return

      // 수직 정렬
      if (Math.abs(activeItem.x - item.x) < snapThreshold) {
        newGuides.push({
          id: `align-x-${item.id}`,
          type: 'vertical',
          position: item.x,
          color: '#10B981',
          opacity: 0.6
        })
      }

      // 수평 정렬
      if (Math.abs(activeItem.y - item.y) < snapThreshold) {
        newGuides.push({
          id: `align-y-${item.id}`,
          type: 'horizontal',
          position: item.y,
          color: '#10B981',
          opacity: 0.6
        })
      }

      // 간격 가이드 (8px, 12px, 16px)
      const spacing = 8
      const distances = [
        { dist: spacing, color: '#F59E0B' },
        { dist: spacing * 1.5, color: '#F59E0B' },
        { dist: spacing * 2, color: '#F59E0B' }
      ]

      distances.forEach(({ dist, color }) => {
        // 오른쪽 간격
        if (Math.abs(activeItem.x - (item.x + item.width + dist)) < snapThreshold) {
          newGuides.push({
            id: `spacing-right-${item.id}-${dist}`,
            type: 'vertical',
            position: item.x + item.width + dist,
            color,
            opacity: 0.5
          })
        }

        // 아래쪽 간격
        if (Math.abs(activeItem.y - (item.y + item.height + dist)) < snapThreshold) {
          newGuides.push({
            id: `spacing-bottom-${item.id}-${dist}`,
            type: 'horizontal',
            position: item.y + item.height + dist,
            color,
            opacity: 0.5
          })
        }
      })
    })

    setGuides(newGuides)
  }, [isVisible, canvasRect, items, activeItemId])

  if (!isVisible || guides.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {guides.map(guide => (
        <div
          key={guide.id}
          className="absolute"
          style={{
            [guide.type === 'vertical' ? 'left' : 'top']: guide.position,
            [guide.type === 'vertical' ? 'width' : 'height']: '1px',
            [guide.type === 'vertical' ? 'height' : 'width']: '100%',
            backgroundColor: guide.color,
            opacity: guide.opacity,
            zIndex: 1000
          }}
        />
      ))}
    </div>
  )
}

// 스냅 포인트 계산 함수
export function calculateSnapPosition(
  x: number, 
  y: number, 
  canvasRect: DOMRect | null,
  items: Array<{ id: string; x: number; y: number; width: number; height: number }>,
  activeItemId: string | null
): { x: number; y: number; snapped: boolean } {
  if (!canvasRect) return { x, y, snapped: false }

  const snapThreshold = 6
  let snappedX = x
  let snappedY = y
  let snapped = false

  // 중앙선 스냅
  const centerX = canvasRect.width / 2
  const centerY = canvasRect.height / 2

  if (Math.abs(x - centerX) < snapThreshold) {
    snappedX = centerX
    snapped = true
  }

  if (Math.abs(y - centerY) < snapThreshold) {
    snappedY = centerY
    snapped = true
  }

  // 다른 아이템과의 정렬 스냅
  items.forEach(item => {
    if (item.id === activeItemId) return

    if (Math.abs(x - item.x) < snapThreshold) {
      snappedX = item.x
      snapped = true
    }

    if (Math.abs(y - item.y) < snapThreshold) {
      snappedY = item.y
      snapped = true
    }
  })

  return { x: snappedX, y: snappedY, snapped }
}
