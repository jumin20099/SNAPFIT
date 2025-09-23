import { BASE_W, BASE_H } from '@/entities/cody/model'

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
export async function downloadCodyAsImage(codyData: CodyImageData, filename?: string): Promise<Blob> {
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
    
    imagesToConvert.forEach((img, index) => {
      const imageElement = img as HTMLImageElement
      originalUrls[index] = imageElement.src
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
        
        const cloneImagePromises = Array.from(clonedImages).map((img, index) => {
          const imageElement = img as HTMLImageElement
          return new Promise<void>((resolve) => {
            const proxyUrl = convertToProxyUrl(imageElement.src);
            console.log(`클론 이미지 ${index} URL 변환: ${imageElement.src} -> ${proxyUrl}`);
            imageElement.src = proxyUrl;
            
            // 이미지 로딩 완료 대기 (더 엄격한 확인)
            const checkImageLoaded = () => {
              if (imageElement.complete && imageElement.naturalHeight > 0 && imageElement.naturalWidth > 0) {
                console.log(`클론 이미지 ${index} 로딩 완료: ${imageElement.src}`);
                resolve();
              }
            };
            
            if (imageElement.complete && imageElement.naturalHeight > 0 && imageElement.naturalWidth > 0) {
              resolve();
            } else {
              const timeout = setTimeout(() => {
                console.warn(`클론 이미지 ${index} 로딩 타임아웃: ${imageElement.src}`);
                resolve();
              }, 10000);
              
              imageElement.onload = () => {
                clearTimeout(timeout);
                checkImageLoaded();
              };
              imageElement.onerror = () => {
                clearTimeout(timeout);
                console.warn(`클론 이미지 ${index} 로딩 실패: ${imageElement.src}`);
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
    imagesToConvert.forEach((img, index) => {
      const imageElement = img as HTMLImageElement
      if (originalUrls[index]) {
        imageElement.src = originalUrls[index]
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
    
    // Canvas를 Blob으로 변환하여 반환
    console.log('Blob 변환 시작...')
    return new Promise<Blob>((resolve, reject) => {
      highResCanvas.toBlob((blob) => {
        if (blob) {
          console.log('Blob 변환 완료')
          resolve(blob)
        } else {
          reject(new Error('Blob 변환 실패'))
        }
      }, 'image/png', 1.0)
    })
  } catch (error) {
    console.error('이미지 생성 실패:', error)
    throw error
  }
}

/**
 * 가상 코디 컨테이너 생성 (썸네일용)
 */
function clamp01(value: number | undefined): number {
  if (typeof value !== 'number') {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

function createVirtualCodyContainer(codyData: CodyImageData, height: number): HTMLElement {
  const stageAspect = BASE_W / BASE_H
  const containerHeight = height
  const containerWidth = Math.round(height * stageAspect)
  const container = document.createElement('div')
  container.setAttribute('data-cody-container', 'true')
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${containerWidth}px;
    height: ${containerHeight}px;
    background: ${codyData.background?.type === 'color' 
      ? (codyData.background?.customColor || codyData.background?.selectedBackground || '#ffffff')
      : '#ffffff'};
    overflow: hidden;
    isolation: isolate;
    transform: translateZ(0);
    border-radius: 8px;
  `
  
  // 배경 이미지가 있는 경우
  if (codyData.background?.type === 'image' && codyData.background?.selectedBackground) {
    container.style.backgroundImage = `url(${codyData.background.selectedBackground})`
    container.style.backgroundSize = 'cover'
    container.style.backgroundPosition = 'center'
  }
  
  // 코디 아이템들 추가
  const maxDimension = Math.min(containerWidth, containerHeight) * 0.6

  codyData.items?.forEach((item, index) => {
    console.log(`아이템 ${index} 데이터:`, item)

    const nx = clamp01(item.nx)
    const ny = clamp01(item.ny)
    const rotation = typeof item.rotation === 'number' ? item.rotation : 0
    const z = typeof item.z === 'number' ? item.z : 1
    const scale = typeof item.scale === 'number' ? item.scale : 1
    const imageUrl = item.src || item.imageUrl || ''
    const name = item.name || `아이템 ${index}`

    if (!imageUrl) {
      console.warn(`아이템 ${index}에 이미지 URL이 없습니다:`, item)
      return
    }

    const intrinsicWidth = item.assetMeta?.intrinsicWidth
      ?? item.metadata?.intrinsicWidth
      ?? item.width
      ?? maxDimension
    const intrinsicHeight = item.assetMeta?.intrinsicHeight
      ?? item.metadata?.intrinsicHeight
      ?? item.height
      ?? maxDimension
    const aspectRatio = intrinsicHeight ? intrinsicWidth / intrinsicHeight : 1

    const scaledBase = maxDimension * scale
    let targetWidth: number
    let targetHeight: number

    if (aspectRatio >= 1) {
      targetWidth = scaledBase
      targetHeight = scaledBase / (aspectRatio || 1)
    } else {
      targetHeight = scaledBase
      targetWidth = scaledBase * aspectRatio
    }

    // 최소 크기 보장
    const minDimension = Math.min(containerWidth, containerHeight) * 0.1
    if (targetWidth < minDimension) {
      const factor = minDimension / targetWidth
      targetWidth *= factor
      targetHeight *= factor
    }
    if (targetHeight < minDimension) {
      const factor = minDimension / targetHeight
      targetWidth *= factor
      targetHeight *= factor
    }

    // 최대 크기 제한
    const absoluteMax = Math.min(containerWidth, containerHeight) * 0.9
    if (targetWidth > absoluteMax || targetHeight > absoluteMax) {
      const factor = absoluteMax / Math.max(targetWidth, targetHeight)
      targetWidth *= factor
      targetHeight *= factor
    }

    const anchor = item.anchor as string | undefined
    const anchorOriginMap: Record<string, { x: number; y: number }> = {
      'top-left': { x: 0, y: 0 },
      'top-right': { x: 1, y: 0 },
      'bottom-left': { x: 0, y: 1 },
      'bottom-right': { x: 1, y: 1 },
      center: { x: 0.5, y: 0.5 },
      'top-center': { x: 0.5, y: 0 },
      'bottom-center': { x: 0.5, y: 1 },
      'middle-left': { x: 0, y: 0.5 },
      'middle-right': { x: 1, y: 0.5 },
    }
    const origin = anchorOriginMap[anchor ?? 'center'] ?? anchorOriginMap.center

    const img = document.createElement('img')
    img.src = imageUrl
    img.alt = name
    img.style.position = 'absolute'
    img.style.left = `${nx * containerWidth}px`
    img.style.top = `${ny * containerHeight}px`
    img.style.width = `${targetWidth}px`
    img.style.height = `${targetHeight}px`
    const translateX = -origin.x * 100
    const translateY = -origin.y * 100
    img.style.transform = `translate(${translateX}%, ${translateY}%) rotate(${rotation}deg)`
    img.style.transformOrigin = `${origin.x * 100}% ${origin.y * 100}%`
    img.style.zIndex = String(z)
    img.style.pointerEvents = 'none'
    img.style.objectFit = 'contain'
    img.style.imageRendering = 'auto'
    container.appendChild(img)
  })
  
  // DOM에 추가 (보이지 않게)
  document.body.appendChild(container)
  
  return container
}

/**
 * 코디를 썸네일 이미지로 변환 (작은 크기)
 */
export async function generateCodyThumbnail(codyData: CodyImageData, height: number = 640): Promise<Blob> {
  console.log('=== generateCodyThumbnail 시작 ===', { codyData })
  
  let codyContainer = document.querySelector('[data-cody-container]') as HTMLElement | null
  const hiddenElements: Array<{ el: HTMLElement; visibility: string; pointer: string; attr: string | null }> = []
  const activeItemStyles: Array<{ el: HTMLElement; outline: string; outlineOffset: string; transform: string }> = []
  let isVirtualContainer = false

  if (codyContainer) {
    const uiElements = Array.from(document.querySelectorAll('[data-thumbnail-ignore]')) as HTMLElement[]
    uiElements.forEach((el) => {
      hiddenElements.push({
        el,
        visibility: el.style.visibility,
        pointer: el.style.pointerEvents,
        attr: el.getAttribute('data-html2canvas-ignore')
      })
      el.setAttribute('data-html2canvas-ignore', 'true')
      el.style.visibility = 'hidden'
      el.style.pointerEvents = 'none'
    })

    const activeItems = Array.from(codyContainer.querySelectorAll('[data-cody-item][data-active="true"]')) as HTMLElement[]
    activeItems.forEach((el) => {
      activeItemStyles.push({
        el,
        outline: el.style.outline,
        outlineOffset: el.style.outlineOffset,
        transform: el.style.transform
      })
      el.style.outline = 'none'
      el.style.outlineOffset = '0px'
      if (el.style.transform?.includes('scale')) {
        el.style.transform = el.style.transform.replace(/scale\([^\)]+\)/, 'scale(1)')
      }
    })
  } else {
    console.log('실제 DOM에서 코디 컨테이너를 찾을 수 없음. 가상 DOM 생성...')
    codyContainer = createVirtualCodyContainer(codyData, height)
    isVirtualContainer = true
  }

  try {
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
    
    imagesToConvert.forEach((img, index) => {
      const imageElement = img as HTMLImageElement
      originalUrls[index] = imageElement.src
      const proxyUrl = convertToProxyUrl(imageElement.src)
      imageElement.src = proxyUrl
    })

    // 추가 대기: 프록시 이미지 안정화
    await new Promise(resolve => setTimeout(resolve, 300))

    // 프록시 이미지들이 완전히 로드될 때까지 대기
    const proxyImageLoadPromises = Array.from(imagesToConvert).map((img, index) => {
      const imageElement = img as HTMLImageElement
      return new Promise<void>((resolve) => {
        // 이미 로드된 경우
        if (imageElement.complete && imageElement.naturalHeight > 0 && imageElement.naturalWidth > 0) {
          resolve()
          return
        }
        
        const timeout = setTimeout(() => {
          console.warn(`프록시 이미지 ${index} 로딩 타임아웃:`, imageElement.src)
          resolve()
        }, 10000)
        
        const checkProxyImageLoaded = () => {
          if (imageElement.complete && imageElement.naturalHeight > 0 && imageElement.naturalWidth > 0) {
            clearTimeout(timeout)
            resolve()
          }
        }
        
        imageElement.onload = checkProxyImageLoaded
        imageElement.onerror = () => {
          clearTimeout(timeout)
          console.warn(`프록시 이미지 ${index} 로딩 실패:`, imageElement.src)
          resolve()
        }
        
        // 추가 확인
        setTimeout(checkProxyImageLoaded, 100)
      })
    })
    
    await Promise.allSettled(proxyImageLoadPromises)

    // html2canvas 라이브러리 동적 로드
    const html2canvas = await import('html2canvas')
    
    const captureWidth = codyContainer.offsetWidth || Math.round(height * (BASE_W / BASE_H))
    const captureHeight = codyContainer.offsetHeight || height
    
    // 코디 영역 캡처 (원본 비율 유지)
    const portraitCanvas = await html2canvas.default(codyContainer, {
      backgroundColor: codyData.background.type === 'color' 
        ? (codyData.background.customColor || codyData.background.selectedBackground)
        : '#ffffff',
      scale: 2,
      useCORS: true, // CORS 활성화 (프록시 이미지 처리)
      allowTaint: false, // tainted canvas 비활성화
      logging: false, // 성능을 위해 로깅 비활성화
      width: captureWidth,
      height: captureHeight,
      foreignObjectRendering: false, // 외부 객체 렌더링 비활성화 (이미지 처리 개선)
      removeContainer: true, // 컨테이너 제거
      imageTimeout: 15000, // 이미지 로딩 타임아웃 증가
      onclone: async (clonedDoc) => {
        // 클론된 문서에서 프록시 URL로 이미지 변환
        const clonedImages = clonedDoc.querySelectorAll('img[src*="snapfit-static-bucket.s3.ap-northeast-2.amazonaws.com"]');
        const cloneImagePromises = Array.from(clonedImages).map((img) => {
          const imageElement = img as HTMLImageElement
          return new Promise<void>((resolve) => {
            const proxyUrl = convertToProxyUrl(imageElement.src);
            imageElement.src = proxyUrl;
            
            // 이미지 로딩 완료 대기
            if (imageElement.complete && imageElement.naturalHeight > 0) {
              resolve();
            } else {
              const timeout = setTimeout(() => resolve(), 5000);
              imageElement.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
              imageElement.onerror = () => {
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
    imagesToConvert.forEach((img, index) => {
      const imageElement = img as HTMLImageElement
      if (originalUrls[index]) {
        imageElement.src = originalUrls[index]
      }
    })

    const stageAspect = BASE_W / BASE_H
    const targetHeight = height
    const targetWidth = Math.round(targetHeight * stageAspect)

    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = targetWidth
    outputCanvas.height = targetHeight
    const outputCtx = outputCanvas.getContext('2d')
    if (!outputCtx) {
      throw new Error('Canvas context 생성 실패')
    }

    const fallbackColor = codyData.background.type === 'color'
      ? (codyData.background.customColor || codyData.background.selectedBackground || '#ffffff')
      : '#ffffff'
    outputCtx.fillStyle = fallbackColor
    outputCtx.fillRect(0, 0, targetWidth, targetHeight)

    const scaleFactor = Math.min(
      targetWidth / portraitCanvas.width,
      targetHeight / portraitCanvas.height
    )
    const drawWidth = portraitCanvas.width * scaleFactor
    const drawHeight = portraitCanvas.height * scaleFactor
    const offsetX = (targetWidth - drawWidth) / 2
    const offsetY = (targetHeight - drawHeight) / 2
    outputCtx.imageSmoothingEnabled = true
    outputCtx.imageSmoothingQuality = 'high'
    outputCtx.drawImage(portraitCanvas, offsetX, offsetY, drawWidth, drawHeight)

    if (isVirtualContainer && codyContainer.parentNode) {
      codyContainer.parentNode.removeChild(codyContainer)
    }

    if (!isVirtualContainer) {
      hiddenElements.forEach(({ el, visibility, pointer, attr }) => {
        if (attr === null) {
          el.removeAttribute('data-html2canvas-ignore')
        } else {
          el.setAttribute('data-html2canvas-ignore', attr)
        }
        el.style.visibility = visibility
        el.style.pointerEvents = pointer
      })
      activeItemStyles.forEach(({ el, outline, outlineOffset, transform }) => {
        el.style.outline = outline
        el.style.outlineOffset = outlineOffset
        el.style.transform = transform
      })
    }

    // Canvas를 Blob으로 변환
    return new Promise<Blob>((resolve, reject) => {
      outputCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('썸네일 Blob 생성 실패'))
        }
      }, 'image/png', 0.9)
    })
  } catch (error) {
    console.error('썸네일 생성 실패:', error)
    // 가상 컨테이너 정리 (에러 시에도)
    if (isVirtualContainer && codyContainer && codyContainer.parentNode) {
      codyContainer.parentNode.removeChild(codyContainer)
    }
    if (!isVirtualContainer) {
      hiddenElements.forEach(({ el, visibility, pointer, attr }) => {
        if (attr === null) {
          el.removeAttribute('data-html2canvas-ignore')
        } else {
          el.setAttribute('data-html2canvas-ignore', attr)
        }
        el.style.visibility = visibility
        el.style.pointerEvents = pointer
      })
      activeItemStyles.forEach(({ el, outline, outlineOffset, transform }) => {
        el.style.outline = outline
        el.style.outlineOffset = outlineOffset
        el.style.transform = transform
      })
    }
    throw error
  }
}
