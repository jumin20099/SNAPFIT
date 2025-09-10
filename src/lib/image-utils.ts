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
      useCORS: true, // CORS 활성화 (프록시를 통해 로드된 이미지들)
      allowTaint: false, // tainted canvas 비활성화
      logging: false,
      width: codyContainer.offsetWidth,
      height: codyContainer.offsetHeight,
      foreignObjectRendering: true, // 외부 객체 렌더링 활성화
      onclone: (clonedDoc) => {
        // 클론된 문서에서 이미지들이 제대로 로드되도록 대기
        const images = clonedDoc.querySelectorAll('img')
        return Promise.all(Array.from(images).map(img => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(img)
            } else {
              img.onload = () => resolve(img)
              img.onerror = () => resolve(img)
            }
          })
        }))
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
      useCORS: true, // CORS 활성화 (프록시를 통해 로드된 이미지들)
      allowTaint: false, // tainted canvas 비활성화
      logging: false,
      width: size,
      height: size,
      foreignObjectRendering: true, // 외부 객체 렌더링 활성화
      onclone: (clonedDoc) => {
        // 클론된 문서에서 이미지들이 제대로 로드되도록 대기
        const images = clonedDoc.querySelectorAll('img')
        return Promise.all(Array.from(images).map(img => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(img)
            } else {
              img.onload = () => resolve(img)
              img.onerror = () => resolve(img)
            }
          })
        }))
      }
    })

    return canvas.toDataURL('image/png', 0.8)
  } catch (error) {
    console.error('썸네일 생성 실패:', error)
    throw error
  }
}
