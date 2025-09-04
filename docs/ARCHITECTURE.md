# SnapFit 아키텍처 문서

## 개요

SnapFit은 Next.js 14와 Spring Boot 3를 기반으로 한 패션 플랫폼입니다. FSD(Feature-Sliced Design) 아키텍처를 채택하여 확장 가능하고 유지보수하기 쉬운 구조를 가지고 있습니다.

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Pretendard 폰트
- **State Management**: TanStack Query + React Context + Zustand
- **Animation**: Framer Motion
- **Testing**: Jest + React Testing Library + Playwright
- **Monitoring**: Sentry
- **Performance**: Lighthouse CI
- **Real-time**: Server-Sent Events (SSE)

### Backend
- **Framework**: Spring Boot 3
- **Language**: Java 17
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT + OAuth2 (Kakao)
- **File Storage**: AWS S3
- **Real-time**: Server-Sent Events (SSE)

## 아키텍처 원칙

### 1. FSD (Feature-Sliced Design)
```
src/
├── shared/           # 공통 유틸리티, UI 컴포넌트, API 클라이언트
│   ├── api/         # API 클라이언트, 쿼리 정의
│   ├── hooks/       # 공통 훅
│   ├── lib/         # 유틸리티 함수
│   ├── types/       # 타입 정의
│   └── ui/          # 공통 UI 컴포넌트
├── entities/         # 비즈니스 엔티티
│   ├── cody/        # 코디 관련 엔티티
│   ├── modal/       # 모달 관련 엔티티
│   ├── product/     # 상품 관련 엔티티
│   └── user/        # 사용자 관련 엔티티
├── features/         # 기능별 모듈
│   ├── cody-builder/ # 코디 빌더 기능
│   ├── notifications/ # 알림 기능
│   ├── product-like/ # 상품 좋아요 기능
│   └── product-search/ # 상품 검색 기능
├── widgets/          # 복합 컴포넌트
│   ├── category-tabs/ # 카테고리 탭 위젯
│   ├── header-nav/   # 헤더 네비게이션 위젯
│   └── product-grid/ # 상품 그리드 위젯
├── components/       # UI 컴포넌트
│   ├── ui/          # 기본 UI 컴포넌트 (shadcn/ui)
│   ├── cody-playground/ # 코디 플레이그라운드
│   └── home-page.tsx # 홈페이지 컴포넌트
├── contexts/         # React Context
├── hooks/           # 커스텀 훅
└── app/             # Next.js App Router
    ├── api/         # API Routes
    ├── (pages)/     # 페이지 컴포넌트
    └── globals.css  # 전역 스타일
```

### 2. 계층 분리
- **Presentation Layer**: UI 컴포넌트
- **Business Logic Layer**: 훅, 서비스
- **Data Layer**: API 클라이언트, 상태 관리
- **Infrastructure Layer**: 유틸리티, 설정

### 3. 의존성 규칙
- 상위 레이어는 하위 레이어에만 의존
- 같은 레이어 간의 의존성 최소화
- 순환 의존성 금지

## 핵심 기능

### 1. 상품 관리
- 상품 목록 조회 (가상화)
- 상품 상세 정보
- 카테고리별 필터링
- 검색 기능

### 2. 코디 시스템
- 3단계 코디 플레이그라운드 (상품 선택 → 코디 구성 → 완성)
- 상품 조합 관리
- 코디 저장/공유
- Framer Motion 애니메이션

### 3. 사용자 관리
- 소셜 로그인 (Kakao)
- 프로필 관리 (닉네임, 프로필 이미지)
- 다크/라이트 모드 지원
- 팔로우/팔로워

### 4. 커뮤니티
- 게시글 작성/조회
- 좋아요/스크랩
- 댓글 시스템

### 5. 실시간 알림
- SSE 기반 알림
- 토스트 알림
- 알림 배지

### 6. 좋아요 시스템
- 좋아요한 상품/게시글/브랜드 관리
- 좋아요 목록 페이지 (/like)
- 탭 기반 UI (게시글/상품/브랜드)

### 7. 하단 탭 네비게이션
- 모든 페이지에서 일관된 네비게이션
- 홈, 좋아요, 커뮤니티, 코디, 마이페이지
- 활성 탭 상태 관리

## 성능 최적화

### 1. 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 형식 지원
- 지연 로딩

### 2. 코드 분할
- 페이지별 동적 임포트
- 컴포넌트별 지연 로딩
- 번들 크기 최적화

### 3. 캐싱 전략
- TanStack Query 캐싱
- Redis 서버 사이드 캐싱
- CDN 정적 자원 캐싱

### 4. 가상화
- 대용량 리스트 가상화 (TanStack Virtual)
- 무한 스크롤
- 성능 모니터링

### 5. 폰트 최적화
- Pretendard 폰트 적용
- font-display: swap으로 로딩 최적화
- CDN 기반 폰트 로딩

## 보안

### 1. 인증/인가
- JWT 토큰 기반 인증
- OAuth2 소셜 로그인
- 역할 기반 접근 제어

### 2. 데이터 보호
- 민감 정보 암호화
- SQL 인젝션 방지
- XSS 방지

### 3. API 보안
- CORS 설정
- Rate Limiting
- 입력 검증

## 모니터링

### 1. 에러 추적
- Sentry 통합
- 실시간 에러 알림
- 성능 모니터링

### 2. 성능 측정
- Core Web Vitals
- Lighthouse CI
- 번들 분석

### 3. 사용자 분석
- 사용자 행동 추적
- 성능 메트릭
- 비즈니스 지표

## 배포

### 1. 환경 구성
- Development
- Staging
- Production

### 2. CI/CD
- GitHub Actions
- 자동 테스트
- 자동 배포

### 3. 인프라
- Vercel (Frontend)
- AWS (Backend)
- Docker 컨테이너

## 개발 가이드

### 1. 코드 스타일
- ESLint 규칙 준수
- Prettier 포맷팅
- TypeScript strict 모드

### 2. 테스트
- 단위 테스트 (Jest)
- 통합 테스트 (RTL)
- E2E 테스트 (Playwright)

### 3. 문서화
- API 문서 (OpenAPI)
- 컴포넌트 문서
- 아키텍처 문서

## 확장 계획

### 1. 단기 (1-3개월)
- 모바일 앱 개발
- AI 추천 시스템
- 결제 시스템 통합

### 2. 중기 (3-6개월)
- 마이크로서비스 아키텍처
- 실시간 채팅
- 라이브 스트리밍

### 3. 장기 (6-12개월)
- 글로벌 확장
- AR/VR 기능
- 블록체인 통합
