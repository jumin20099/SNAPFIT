'use client'

import React from 'react'

// 배경 테마 정의 (CodyBackgroundModal과 동일)
const BACKGROUND_THEMES = {
  white: { name: '화이트', color: '#ffffff' },
  black: { name: '블랙', color: '#000000' },
  cool: { name: '쿨', color: '#f0f9ff' },
  warm: { name: '웜', color: '#fef3c7' },
  lovely: { name: '러블리', color: '#fce7f3' },
} as const

// 장면 프리셋 정의
export const SCENE_PRESETS = {
  editorial: {
    name: '에디토리얼 클린',
    background: 'linear-gradient(135deg, #F8F8F8 0%, #ECECEC 100%)',
    vignette: { strength: 0.06, inner: 0.65, falloff: 0.20 },
    paperNoise: { opacity: 0.12 },
    stage: { type: 'none' as const }
  },
  warm: {
    name: '웜 스튜디오',
    background: 'linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 100%)',
    vignette: { strength: 0.04, inner: 0.70, falloff: 0.15 },
    paperNoise: { opacity: 0.08 },
    stage: { 
      type: 'floor' as const, 
      radius: 0.8, 
      blur: 40,
      color: 'rgba(255, 255, 255, 0.3)'
    }
  },
  gallery: {
    name: '다크 갤러리',
    background: 'linear-gradient(135deg, #0E0F12 0%, #1A1B1E 100%)',
    vignette: { strength: 0.15, inner: 0.60, falloff: 0.25 },
    paperNoise: { opacity: 0.18 },
    stage: { type: 'none' as const }
  }
} as const

export type ScenePreset = keyof typeof SCENE_PRESETS

// 장면 오버레이 컴포넌트
export function SceneOverlay({ 
  preset, 
  children,
  customBackground
}: { 
  preset: ScenePreset
  children: React.ReactNode
  customBackground?: {
    type: 'color' | 'image'
    selectedBackground: string
    customColor: string
  }
}) {
  const scene = SCENE_PRESETS[preset]
  
  // 사용자 배경 설정이 있으면 우선 적용
  const getBackgroundStyle = () => {
    if (customBackground) {
      if (customBackground.type === 'color') {
        if (customBackground.selectedBackground === 'custom') {
          return { background: customBackground.customColor }
        } else {
          // BACKGROUND_THEMES에서 색상 찾기 (키로 직접 매칭)
          const themeKey = customBackground.selectedBackground as keyof typeof BACKGROUND_THEMES
          const theme = BACKGROUND_THEMES[themeKey]
          return { background: theme?.color || customBackground.customColor }
        }
      } else if (customBackground.type === 'image') {
        return { 
          backgroundImage: `url(${customBackground.selectedBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      }
    }
    // 기본 프리셋 배경 사용
    return { background: scene.background }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 배경 그라데이션 */}
      <div 
        className="absolute inset-0"
        style={getBackgroundStyle()}
      />
      
      {/* 스테이지 플레이트 (웜 스튜디오만) */}
      {scene.stage.type === 'floor' && (
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          style={{
            width: `${scene.stage.radius * 100}%`,
            height: '200px',
            background: `radial-gradient(ellipse at center top, ${scene.stage.color} 0%, transparent 70%)`,
            filter: `blur(${scene.stage.blur}px)`,
            transform: 'translateX(-50%) translateY(50%)'
          }}
        />
      )}
      
      {/* 비네트 오버레이 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent ${scene.vignette.inner * 100}%, rgba(0,0,0,${scene.vignette.strength}) ${(scene.vignette.inner + scene.vignette.falloff) * 100}%)`
        }}
      />
      
      {/* 페이퍼 노이즈 오버레이 */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
          opacity: scene.paperNoise.opacity,
          mixBlendMode: 'multiply'
        }}
      />
      
      {/* 콘텐츠 */}
      {children}
    </div>
  )
}

// 아이템별 그림자 규칙
export const SHADOW_RULES = {
  top: { 
    contact: { blur: 24, alpha: 0.20, yOffset: 8 },
    cast: { dx: 2, dy: 8, blur: 16, alpha: 0.15 }
  },
  outer: { 
    contact: { blur: 28, alpha: 0.22, yOffset: 10 },
    cast: { dx: 3, dy: 10, blur: 20, alpha: 0.18 }
  },
  bottom: { 
    contact: { blur: 22, alpha: 0.18, yOffset: 6 },
    cast: { dx: 2, dy: 6, blur: 14, alpha: 0.12 }
  },
  shoes: { 
    contact: { blur: 30, alpha: 0.25, yOffset: 12 },
    cast: { dx: 2, dy: 8, blur: 18, alpha: 0.16 }
  },
  accessory: { 
    contact: { blur: 16, alpha: 0.15, yOffset: 4 },
    cast: { dx: 1, dy: 4, blur: 10, alpha: 0.10 }
  },
  default: { 
    contact: { blur: 20, alpha: 0.18, yOffset: 6 },
    cast: { dx: 2, dy: 6, blur: 12, alpha: 0.12 }
  }
} as const

// 그림자 스타일 생성 함수
export function getShadowStyles(slot: string, isSelected: boolean = false) {
  const rules = SHADOW_RULES[slot as keyof typeof SHADOW_RULES] || SHADOW_RULES.default
  
  const contactShadow = `0 ${rules.contact.yOffset}px ${rules.contact.blur}px rgba(0,0,0,${rules.contact.alpha})`
  const castShadow = `${rules.cast.dx}px ${rules.cast.dy}px ${rules.cast.blur}px rgba(0,0,0,${rules.cast.alpha})`
  
  return {
    filter: `drop-shadow(${castShadow})`,
    '::after': {
      content: '""',
      position: 'absolute',
      bottom: `-${rules.contact.blur / 2}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      height: `${rules.contact.blur}px`,
      background: `radial-gradient(ellipse, rgba(0,0,0,${rules.contact.alpha}) 0%, transparent 70%)`,
      filter: `blur(${rules.contact.blur / 2}px)`,
      pointerEvents: 'none'
    },
    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
    transition: 'transform 120ms ease-out'
  }
}
