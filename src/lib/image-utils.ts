// 코디 이미지 변환 유틸리티

export interface CodyImageData {
  items: any[]
  background: {
    type: 'color' | 'image'
    selectedBackground: string
    customColor: string
  }
}

// 실제 코디 플레이그라운드와 동일한 상수들
const BASE_W = 400
const BASE_H = 600

// 카테고리별 이미지 크기 설정 (px 단위) - 실제 코디와 동일
const ITEM_SIZES: Record<string, { width: number; height: number }> = {
  top: { width: 500, height: 500 },
  outer: { width: 700, height: 700 },
  bottom: { width: 700, height: 700 },
  dresses: { width: 250, height: 350 },
  shoes: { width: 350, height: 350 },
  bag: { width: 400, height: 400 },
  hat: { width: 300, height: 300 },
  glasses: { width: 300, height: 300 },
  watch: { width: 250, height: 250 },
  belt: { width: 100, height: 40 },
  socks: { width: 80, height: 120 },
  jewelry: { width: 300, height: 300 },
  accessory: { width: 200, height: 200 },
  ring: { width: 200, height: 200 },
  bracelet: { width: 200, height: 200 },
  necklace: { width: 200, height: 200 },
}

// ViewTransform 타입 정의
interface ViewTransform {
  scale: number
  offsetX: number
  offsetY: number
  containerW: number
  containerH: number
}

// 실제 코디와 동일한 변환 함수
function buildViewTransform(containerW: number, containerH: number): ViewTransform {
  const scale = Math.min(containerW / BASE_W, containerH / BASE_H)
  const offsetX = (containerW - BASE_W * scale) / 2
  const offsetY = (containerH - BASE_H * scale) / 2

  return { scale, offsetX, offsetY, containerW, containerH }
}

// 실제 코디와 동일한 픽셀 계산 함수
function computePixelRect(
  item: any,
  transform: ViewTransform,
  baseImgW: number,
  baseImgH: number
) {
  // 정규화 좌표를 BASE 기준 픽셀 좌표로 변환
  const xBase = item.nx * BASE_W
  const yBase = item.ny * BASE_H

  // 자산 메타데이터에서 실제 크기와 핫스팟 가져오기
  const assetMeta = item.assetMeta
  const intrinsicW = baseImgW
  const intrinsicH = baseImgH
  const hotspot = assetMeta?.hotspot || { x: 0.5, y: 0.5 }
  const trimOffset = assetMeta?.trimOffset || { x: 0, y: 0 }

  // 아이템 렌더 크기 (스케일 포함)
  const w = intrinsicW * (item.scale || 1) * transform.scale
  const h = intrinsicH * (item.scale || 1) * transform.scale

  // 기준점 좌표
  let x = transform.offsetX + xBase * transform.scale
  let y = transform.offsetY + yBase * transform.scale

  // 핫스팟 기반 앵커 보정
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
    default:
      x = x + hotspotOffsetX - trimOffsetX
      y = y + hotspotOffsetY - trimOffsetY
      break
  }

  return { x, y, w, h }
}

/**
 * 코디 데이터를 이미지로 변환하여 다운로드
 */
export async function downloadCodyAsImage(codyData: CodyImageData, filename?: string): Promise<void> {
  try {
    // 캔버스 생성
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas context를 가져올 수 없습니다')
    }

    // 캔버스 크기 설정 (실제 코디와 동일한 비율)
    const canvasSize = 800
    canvas.width = canvasSize
    canvas.height = canvasSize

    // ViewTransform 생성 (실제 코디와 동일)
    const transform = buildViewTransform(canvasSize, canvasSize)

    // 배경 그리기
    if (codyData.background.type === 'color') {
      ctx.fillStyle = codyData.background.customColor || codyData.background.selectedBackground
      ctx.fillRect(0, 0, canvasSize, canvasSize)
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasSize, canvasSize)
    }

    // 코디 아이템들을 그리기 (실제 코디와 동일한 로직)
    await drawCodyItems(ctx, codyData.items, transform)

    // 이미지 다운로드
    const link = document.createElement('a')
    link.download = filename || `cody-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  } catch (error) {
    console.error('이미지 생성 실패:', error)
    throw error
  }
}

/**
 * 코디 아이템들을 캔버스에 그리기 (실제 코디와 동일한 로직)
 */
async function drawCodyItems(ctx: CanvasRenderingContext2D, items: any[], transform: ViewTransform): Promise<void> {
  // z-index 순으로 정렬 (실제 코디와 동일)
  const sortedItems = [...items].sort((a, b) => (a.z || 0) - (b.z || 0))

  for (const item of sortedItems) {
    if (!item.visible) continue

    try {
      // 이미지 로드 (CORS 문제 해결을 위해 프록시 사용)
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      // S3 이미지인 경우 프록시를 통해 로드
      const imageUrl = item.src.includes('snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com')
        ? `/api/image-proxy?url=${encodeURIComponent(item.src)}`
        : item.src
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      // 아이템의 카테고리별 크기 가져오기
      const slot = item.slot || 'accessory'
      const itemSize = ITEM_SIZES[slot] || ITEM_SIZES.accessory
      
      // 실제 코디와 동일한 픽셀 계산
      const pixelRect = computePixelRect(item, transform, itemSize.width, itemSize.height)

      // 회전 적용
      ctx.save()
      ctx.translate(pixelRect.x + pixelRect.w / 2, pixelRect.y + pixelRect.h / 2)
      ctx.rotate((item.rotation || 0) * Math.PI / 180)
      ctx.translate(-pixelRect.w / 2, -pixelRect.h / 2)

      // 투명도 적용
      ctx.globalAlpha = item.opacity || 1

      // 이미지 그리기 (실제 코디와 동일한 크기)
      ctx.drawImage(img, 0, 0, pixelRect.w, pixelRect.h)

      ctx.restore()
    } catch (error) {
      console.warn(`아이템 ${item.name || item.slot} 그리기 실패:`, error)
    }
  }
}

/**
 * 코디를 썸네일 이미지로 변환 (작은 크기)
 */
export async function generateCodyThumbnail(codyData: CodyImageData, size: number = 200): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas context를 가져올 수 없습니다')
  }

  canvas.width = size
  canvas.height = size

  // ViewTransform 생성 (실제 코디와 동일)
  const transform = buildViewTransform(size, size)

  // 배경 그리기
  if (codyData.background.type === 'color') {
    ctx.fillStyle = codyData.background.customColor || codyData.background.selectedBackground
    ctx.fillRect(0, 0, size, size)
  } else {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
  }

  // 코디 아이템들을 그리기 (실제 코디와 동일한 로직)
  await drawCodyItems(ctx, codyData.items, transform)

  return canvas.toDataURL('image/png', 0.8)
}
