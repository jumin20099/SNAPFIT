# SNAPFIT - 모바일 우선 패션 플랫폼

SNAPFIT은 "Outfit-first → Category-first"로 리팩토링된 모바일 우선 패션 플랫폼입니다.

## 🚀 **새로운 아키텍처**

### **라우팅 구조**
- `/` → 홈 (카테고리/상품 탐색)
- `/community` → 커뮤니티 피드
- `/cody` → 코디 플레이그라운드
- `/me` → 마이페이지

### **핵심 컴포넌트**
- `<BottomTabBar/>` - 하단 고정 탭 네비게이션
- `<HomePage/>` - 카테고리/상품 탐색 홈
- `<CodyPlayground/>` - 코디 구성 플레이그라운드
- `<ProductCard/>` - 상품 카드 (코디 해보기 CTA)
- `<CategorySelector/>` - 하단 시트 형태 카테고리 선택기

## 🎨 **디자인 시스템**

### **모바일 우선 (360~430px)**
- 2열 그리드 레이아웃
- 터치 타겟 44px+
- Safe area 대응 (`env(safe-area-inset-*)`)

### **스타일 가이드**
- `radius-2xl` - 둥근 모서리
- `shadow-md/lg` - 부드러운 그림자
- `tracking-tight` - 타이트한 자간
- `text-balance` - 텍스트 균형

### **모션 (Framer Motion)**
- 등장/전환: `y: 8~12px`, `duration: 0.2~0.25s`
- Easing: `easeOut`
- Spring 애니메이션 (카테고리 선택기)

## 🏗️ **기술 스택**

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui (Radix 기반)
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Testing**: Vitest + @testing-library/react

## 🚀 **시작하기**

### **개발 환경 설정**
```bash
npm install
npm run dev
```

### **E2E 테스트 실행**
```bash
npm run test:e2e
```

### **빌드**
```bash
npm run build
npm start
```

## 📱 **사용자 플로우**

### **1. 홈 진입**
- 검색바 (sticky)
- 카테고리 칩 (수평 스크롤)
- 실루엣 가이드
- 상품 그리드 (2열)

### **2. 코디 시작**
- 상품 카드의 "코디 해보기" 버튼 클릭
- `/cody-system?pid={productId}` 라우팅 (리팩토링 이전의 메인 페이지)
- 선택된 상품 프리로드

### **3. 코디 구성**
- 단계별 진행 (상품 선택 → 코디 구성 → 완성)
- 카테고리 선택기 (하단 시트)
- 상품 그리드에서 다중 선택

## 🧪 **테스트**

### **컴포넌트 테스트**
```bash
npm test
```

### **테스트 커버리지**
- 홈페이지 렌더링
- 상품 검색/필터링
- 코디 플레이그라운드 단계 진행
- 탭 네비게이션 활성 상태

## 🎯 **성능 최적화**

- **이미지**: Next.js Image 컴포넌트
- **코드 분할**: Dynamic import
- **스켈레톤**: 로딩 상태 UI
- **Prefetch**: 자주 사용되는 경로

## ♿ **접근성**

- **ARIA**: `role`, `aria-*` 속성
- **키보드**: 포커스 관리
- **색상 대비**: AA 이상
- **다크모드**: 시스템 테마 지원

## 🔧 **개발 가이드**

### **컴포넌트 생성**
```tsx
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ComponentName() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6"
    >
      {/* 컴포넌트 내용 */}
    </motion.div>
  )
}
```

### **상태 관리 (Zustand)**
```tsx
import { create } from 'zustand'

interface Store {
  data: any[]
  isLoading: boolean
  fetchData: () => Promise<void>
}

export const useStore = create<Store>((set) => ({
  data: [],
  isLoading: false,
  fetchData: async () => {
    set({ isLoading: true })
    // API 호출
    set({ isLoading: false })
  }
}))
```

## 📝 **커밋 컨벤션**

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `refactor:` 리팩토링
- `style:` UI/UX 개선
- `test:` 테스트 추가/수정

## 🤝 **기여하기**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
