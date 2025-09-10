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
 * 코디 영역을 스크린샷으로 캡처하여 이미지로 다운로드
 */
export async function downloadCodyAsImage(codyData: CodyImageData, filename?: string): Promise<void> {
  try {
    // 코디 플레이그라운드 컨테이너 찾기
    const codyContainer = document.querySelector('[data-cody-container]') as HTMLElement
    if (!codyContainer) {
      throw new Error('코디 컨테이너를 찾을 수 없습니다')
    }

    // html2canvas 라이브러리 동적 로드
    const html2canvas = await import('html2canvas')
    
    // 코디 영역만 캡처 (배경 포함)
    const canvas = await html2canvas.default(codyContainer, {
      backgroundColor: codyData.background.type === 'color' 
        ? (codyData.background.customColor || codyData.background.selectedBackground)
        : '#ffffff',
      scale: 2, // 고해상도
      useCORS: false, // CORS 비활성화
      allowTaint: true, // tainted canvas 허용
      logging: false,
      width: codyContainer.offsetWidth,
      height: codyContainer.offsetHeight,
      foreignObjectRendering: true, // 외부 객체 렌더링 활성화
      onclone: async (clonedDoc) => {
        // 클론된 문서에서 S3 이미지들을 프록시 URL로 변경
        const images = clonedDoc.querySelectorAll('img')
        images.forEach(img => {
          if (img.src.includes('snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com')) {
            img.src = `/api/image-proxy?url=${encodeURIComponent(img.src)}`
          }
        })
        
        // 모든 이미지가 로드될 때까지 기다립니다
        const promises = Array.from(images).map(img => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
          })
        })
        await Promise.allSettled(promises)
      }
    })

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
 * 코디를 썸네일 이미지로 변환 (작은 크기)
 */
export async function generateCodyThumbnail(codyData: CodyImageData, size: number = 200): Promise<string> {
  try {
    // 코디 플레이그라운드 컨테이너 찾기
    const codyContainer = document.querySelector('[data-cody-container]') as HTMLElement
    if (!codyContainer) {
      throw new Error('코디 컨테이너를 찾을 수 없습니다')
    }

    // html2canvas 라이브러리 동적 로드
    const html2canvas = await import('html2canvas')
    
    // 코디 영역 캡처
    const canvas = await html2canvas.default(codyContainer, {
      backgroundColor: codyData.background.type === 'color' 
        ? (codyData.background.customColor || codyData.background.selectedBackground)
        : '#ffffff',
      scale: 1,
      useCORS: false, // CORS 비활성화
      allowTaint: true, // tainted canvas 허용
      logging: false,
      width: size,
      height: size,
      foreignObjectRendering: true, // 외부 객체 렌더링 활성화
      onclone: async (clonedDoc) => {
        // 클론된 문서에서 S3 이미지들을 프록시 URL로 변경
        const images = clonedDoc.querySelectorAll('img')
        images.forEach(img => {
          if (img.src.includes('snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com')) {
            img.src = `/api/image-proxy?url=${encodeURIComponent(img.src)}`
          }
        })
        
        // 모든 이미지가 로드될 때까지 기다립니다
        const promises = Array.from(images).map(img => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
          })
        })
        await Promise.allSettled(promises)
      }
    })

    return canvas.toDataURL('image/png', 0.8)
  } catch (error) {
    console.error('썸네일 생성 실패:', error)
    throw error
  }
}
