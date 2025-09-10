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
 * S3 이미지 URL을 프록시 URL로 변환
 */
function convertToProxyUrl(originalUrl: string): string {
  if (originalUrl.includes('snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com')) {
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`
  }
  return originalUrl
}

/**
 * 코디 영역을 스크린샷으로 캡처하여 이미지로 다운로드
 */
export async function downloadCodyAsImage(codyData: CodyImageData, filename?: string): Promise<void> {
  console.log('=== downloadCodyAsImage 시작 ===', { codyData, filename })
  try {
    // 코디 플레이그라운드 컨테이너 찾기
    const codyContainer = document.querySelector('[data-cody-container]') as HTMLElement
    console.log('코디 컨테이너 찾기:', codyContainer)
    if (!codyContainer) {
      throw new Error('코디 컨테이너를 찾을 수 없습니다')
    }

    // 모든 이미지가 완전히 로드될 때까지 대기
    const images = codyContainer.querySelectorAll('img')
    console.log('발견된 이미지 개수:', images.length)
    
    if (images.length === 0) {
      console.warn('코디 컨테이너에 이미지가 없습니다!')
    } else {
      images.forEach((img, index) => {
        console.log(`이미지 ${index}:`, { 
          src: img.src, 
          complete: img.complete, 
          naturalHeight: img.naturalHeight,
          naturalWidth: img.naturalWidth,
          alt: img.alt
        })
      })
    }
    
    const imageLoadPromises = Array.from(images).map((img, index) => {
      return new Promise<void>((resolve) => {
        // 이미지가 완전히 로드되었는지 더 엄격하게 확인
        if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
          console.log(`이미지 ${index} 이미 로드됨`)
          resolve()
          return
        }
        
        console.log(`이미지 ${index} 로딩 시작:`, img.src)
        const timeout = setTimeout(() => {
          console.warn(`이미지 ${index} 로딩 타임아웃:`, img.src)
          resolve()
        }, 15000) // 타임아웃 증가
        
        // 이미지 로드 완료 확인
        const checkImageLoaded = () => {
          if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
            clearTimeout(timeout)
            console.log(`이미지 ${index} 로딩 완료:`, img.src)
            resolve()
          }
        }
        
        img.onload = checkImageLoaded
        img.onerror = () => {
          clearTimeout(timeout)
          console.warn(`이미지 ${index} 로딩 실패:`, img.src)
          resolve()
        }
        
        // 추가 확인: 이미지가 이미 로드되었을 수 있음
        setTimeout(checkImageLoaded, 100)
      })
    })
    
    // 모든 이미지 로딩 완료 대기
    console.log('이미지 로딩 대기 시작...')
    await Promise.allSettled(imageLoadPromises)
    console.log('이미지 로딩 대기 완료')
    
    // 추가 대기: DOM이 완전히 렌더링될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 500))

    // 원본 이미지 URL 저장 (복원용)
    console.log('원본 이미지 URL 저장...')
    const imagesToConvert = codyContainer.querySelectorAll('img[src*="snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com"]')
    const originalUrls: string[] = []
    
    imagesToConvert.forEach((img: HTMLImageElement, index) => {
      originalUrls[index] = img.src
    })
    console.log('원본 이미지 URL 저장 완료')

    // html2canvas 라이브러리 동적 로드
    console.log('html2canvas 라이브러리 로드 시작...')
    const html2canvas = await import('html2canvas')
    console.log('html2canvas 라이브러리 로드 완료')
    
    // 코디 영역만 캡처 (배경 포함)
    console.log('html2canvas 캡처 시작...')
    const canvas = await html2canvas.default(codyContainer, {
      backgroundColor: codyData.background.type === 'color' 
        ? (codyData.background.customColor || codyData.background.selectedBackground)
        : '#ffffff',
      scale: 1, // 왜곡 방지를 위해 1로 설정
      useCORS: false, // CORS 비활성화 (프록시 이미지가 이미 CORS 해결됨)
      allowTaint: true, // tainted canvas 허용 (프록시 이미지 처리)
      logging: true, // 디버깅을 위해 로깅 활성화
      width: codyContainer.offsetWidth,
      height: codyContainer.offsetHeight,
      foreignObjectRendering: false, // 외부 객체 렌더링 비활성화
      removeContainer: true, // 컨테이너 제거
      imageTimeout: 20000, // 이미지 로딩 타임아웃 증가
      scrollX: 0, // 스크롤 위치 고정
      scrollY: 0, // 스크롤 위치 고정
      windowWidth: window.innerWidth, // 뷰포트 크기 명시
      windowHeight: window.innerHeight, // 뷰포트 크기 명시
      ignoreElements: (element) => {
        // 불필요한 요소 제외 (버튼, UI 요소 등)
        return element.classList.contains('absolute') && 
               (element.classList.contains('bottom-24') || element.classList.contains('left-4') || element.classList.contains('right-4'));
      },
      onclone: async (clonedDoc) => {
        console.log('onclone 시작: 클론된 문서에서 이미지 처리');
        
        // 클론된 문서에서 프록시 URL로 이미지 변환
        const clonedImages = clonedDoc.querySelectorAll('img[src*="snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com"]');
        console.log(`클론된 이미지 개수: ${clonedImages.length}`);
        
        const cloneImagePromises = Array.from(clonedImages).map((img: HTMLImageElement, index) => {
          return new Promise<void>((resolve) => {
            const proxyUrl = convertToProxyUrl(img.src);
            console.log(`클론 이미지 ${index} URL 변환: ${img.src} -> ${proxyUrl}`);
            img.src = proxyUrl;
            
            // 이미지 로딩 완료 대기 (더 엄격한 확인)
            const checkImageLoaded = () => {
              if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
                console.log(`클론 이미지 ${index} 로딩 완료: ${img.src}`);
                resolve();
              }
            };
            
            if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
              resolve();
            } else {
              const timeout = setTimeout(() => {
                console.warn(`클론 이미지 ${index} 로딩 타임아웃: ${img.src}`);
                resolve();
              }, 10000);
              
              img.onload = () => {
                clearTimeout(timeout);
                checkImageLoaded();
              };
              img.onerror = () => {
                clearTimeout(timeout);
                console.warn(`클론 이미지 ${index} 로딩 실패: ${img.src}`);
                resolve();
              };
              
              // 추가 확인
              setTimeout(checkImageLoaded, 100);
            }
          });
        });
        
        await Promise.allSettled(cloneImagePromises);
        
        // 최종 이미지 상태 확인
        const finalImages = clonedDoc.querySelectorAll('img');
        console.log('클론된 문서 최종 이미지 상태:');
        finalImages.forEach((img: HTMLImageElement, index) => {
          console.log(`  이미지 ${index}:`, {
            src: img.src,
            complete: img.complete,
            naturalHeight: img.naturalHeight,
            naturalWidth: img.naturalWidth,
            alt: img.alt
          });
        });
        
        return clonedDoc;
      }
    })
    console.log('html2canvas 캡처 완료')

    // 원본 URL로 복원
    console.log('이미지 URL을 원본으로 복원 시작...')
    imagesToConvert.forEach((img: HTMLImageElement, index) => {
      if (originalUrls[index]) {
        img.src = originalUrls[index]
      }
    })
    console.log('이미지 URL 복원 완료')


    // 고해상도 처리를 위한 Canvas 리사이징
    console.log('고해상도 처리 시작...')
    const highResCanvas = document.createElement('canvas')
    const ctx = highResCanvas.getContext('2d')
    const targetScale = 2 // 최종 해상도 배율
    
    highResCanvas.width = canvas.width * targetScale
    highResCanvas.height = canvas.height * targetScale
    
    if (ctx) {
      // 고품질 이미지 스케일링
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(canvas, 0, 0, highResCanvas.width, highResCanvas.height)
    }
    
    // 이미지 다운로드
    console.log('이미지 다운로드 시작...')
    const link = document.createElement('a')
    link.download = filename || `cody-${new Date().toISOString().split('T')[0]}.png`
    link.href = highResCanvas.toDataURL('image/png', 1.0)
    link.click()
    console.log('이미지 다운로드 완료')
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

    // 모든 이미지가 완전히 로드될 때까지 대기
    const images = codyContainer.querySelectorAll('img')
    const imageLoadPromises = Array.from(images).map((img, index) => {
      return new Promise<void>((resolve) => {
        // 이미지가 완전히 로드되었는지 더 엄격하게 확인
        if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
          resolve()
          return
        }
        
        const timeout = setTimeout(() => {
          console.warn(`이미지 ${index} 로딩 타임아웃:`, img.src)
          resolve()
        }, 15000) // 타임아웃 증가
        
        // 이미지 로드 완료 확인
        const checkImageLoaded = () => {
          if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
            clearTimeout(timeout)
            resolve()
          }
        }
        
        img.onload = checkImageLoaded
        img.onerror = () => {
          clearTimeout(timeout)
          console.warn(`이미지 ${index} 로딩 실패:`, img.src)
          resolve()
        }
        
        // 추가 확인: 이미지가 이미 로드되었을 수 있음
        setTimeout(checkImageLoaded, 100)
      })
    })
    
    // 모든 이미지 로딩 완료 대기
    await Promise.allSettled(imageLoadPromises)
    
    // 추가 대기: DOM이 완전히 렌더링될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 500))

    // S3 이미지들을 프록시 URL로 변환
    const imagesToConvert = codyContainer.querySelectorAll('img[src*="snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com"]')
    const originalUrls: string[] = []
    
    imagesToConvert.forEach((img: HTMLImageElement, index) => {
      originalUrls[index] = img.src
      const proxyUrl = convertToProxyUrl(img.src)
      img.src = proxyUrl
    })

    // 추가 대기: 프록시 이미지 안정화
    await new Promise(resolve => setTimeout(resolve, 300))

    // 프록시 이미지들이 완전히 로드될 때까지 대기
    const proxyImageLoadPromises = Array.from(imagesToConvert).map((img: HTMLImageElement, index) => {
      return new Promise<void>((resolve) => {
        // 이미 로드된 경우
        if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
          resolve()
          return
        }
        
        const timeout = setTimeout(() => {
          console.warn(`프록시 이미지 ${index} 로딩 타임아웃:`, img.src)
          resolve()
        }, 10000)
        
        const checkProxyImageLoaded = () => {
          if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
            clearTimeout(timeout)
            resolve()
          }
        }
        
        img.onload = checkProxyImageLoaded
        img.onerror = () => {
          clearTimeout(timeout)
          console.warn(`프록시 이미지 ${index} 로딩 실패:`, img.src)
          resolve()
        }
        
        // 추가 확인
        setTimeout(checkProxyImageLoaded, 100)
      })
    })
    
    await Promise.allSettled(proxyImageLoadPromises)

    // html2canvas 라이브러리 동적 로드
    const html2canvas = await import('html2canvas')
    
    // 코디 영역 캡처
    const canvas = await html2canvas.default(codyContainer, {
      backgroundColor: codyData.background.type === 'color' 
        ? (codyData.background.customColor || codyData.background.selectedBackground)
        : '#ffffff',
      scale: 1,
      useCORS: true, // CORS 활성화 (프록시 이미지 처리)
      allowTaint: false, // tainted canvas 비활성화
      logging: true, // 디버깅을 위해 로깅 활성화
      width: size,
      height: size,
      foreignObjectRendering: false, // 외부 객체 렌더링 비활성화 (이미지 처리 개선)
      removeContainer: true, // 컨테이너 제거
      imageTimeout: 15000, // 이미지 로딩 타임아웃 증가
      onclone: async (clonedDoc) => {
        // 클론된 문서에서 프록시 URL로 이미지 변환
        const clonedImages = clonedDoc.querySelectorAll('img[src*="snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com"]');
        const cloneImagePromises = Array.from(clonedImages).map((img: HTMLImageElement) => {
          return new Promise<void>((resolve) => {
            const proxyUrl = convertToProxyUrl(img.src);
            img.src = proxyUrl;
            
            // 이미지 로딩 완료 대기
            if (img.complete && img.naturalHeight > 0) {
              resolve();
            } else {
              const timeout = setTimeout(() => resolve(), 5000);
              img.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
              img.onerror = () => {
                clearTimeout(timeout);
                resolve();
              };
            }
          });
        });
        
        await Promise.allSettled(cloneImagePromises);
        return clonedDoc;
      }
    })

    // 원본 URL로 복원
    imagesToConvert.forEach((img: HTMLImageElement, index) => {
      if (originalUrls[index]) {
        img.src = originalUrls[index]
      }
    })


    return canvas.toDataURL('image/png', 0.8)
  } catch (error) {
    console.error('썸네일 생성 실패:', error)
    throw error
  }
}