// 코디 이미지 변환 유틸리티

export interface CodyImageData {
  items: any[]
  background: {
    type: 'color' | 'image'
    selectedBackground: string
    customColor: string
  }
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

    // 캔버스 크기 설정 (정사각형)
    const size = 800
    canvas.width = size
    canvas.height = size

    // 배경 그리기
    if (codyData.background.type === 'color') {
      ctx.fillStyle = codyData.background.customColor || codyData.background.selectedBackground
      ctx.fillRect(0, 0, size, size)
    } else {
      // 이미지 배경의 경우 (나중에 구현)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
    }

    // 코디 아이템들을 그리기
    await drawCodyItems(ctx, codyData.items, size)

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
 * 코디 아이템들을 캔버스에 그리기
 */
async function drawCodyItems(ctx: CanvasRenderingContext2D, items: any[], canvasSize: number): Promise<void> {
  for (const item of items) {
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

      // 아이템 위치 및 크기 계산
      const x = item.nx * canvasSize
      const y = item.ny * canvasSize
      const scale = item.scale || 1
      const rotation = item.rotation || 0

      // 이미지 크기 계산 (비율 유지)
      const imgWidth = img.width * scale
      const imgHeight = img.height * scale

      // 회전 중심점 설정
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      
      // 앵커 포인트에 따른 위치 조정
      const anchorX = item.anchor === 'center' ? -imgWidth / 2 : 0
      const anchorY = item.anchor === 'center' ? -imgHeight / 2 : 0

      // 이미지 그리기
      ctx.globalAlpha = item.opacity || 1
      ctx.drawImage(img, anchorX, anchorY, imgWidth, imgHeight)
      
      ctx.restore()
    } catch (error) {
      console.warn(`아이템 ${item.name} 그리기 실패:`, error)
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

  // 배경 그리기
  if (codyData.background.type === 'color') {
    ctx.fillStyle = codyData.background.customColor || codyData.background.selectedBackground
    ctx.fillRect(0, 0, size, size)
  } else {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
  }

  // 코디 아이템들을 그리기
  await drawCodyItems(ctx, codyData.items, size)

  return canvas.toDataURL('image/png', 0.8)
}
