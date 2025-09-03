# SnapFit 아키텍처 문서

## 개요

SnapFit은 Next.js 14와 Spring Boot 3를 기반으로 한 패션 플랫폼입니다. FSD(Feature-Sliced Design) 아키텍처를 채택하여 확장 가능하고 유지보수하기 쉬운 구조를 가지고 있습니다.

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + React Context
- **Testing**: Jest + React Testing Library + Playwright
- **Monitoring**: Sentry
- **Performance**: Lighthouse CI

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
├── shared/           # 공통 유틸리티, UI 컴포넌트
├── entities/         # 비즈니스 엔티티
├── features/         # 기능별 모듈
├── widgets/          # 복합 컴포넌트
└── app/             # 라우팅, 레이아웃
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
- 3D 코디 빌더
- 상품 조합 관리
- 코디 저장/공유

### 3. 사용자 관리
- 소셜 로그인 (Kakao)
- 프로필 관리
- 팔로우/팔로워

### 4. 커뮤니티
- 게시글 작성/조회
- 좋아요/스크랩
- 댓글 시스템

### 5. 실시간 알림
- SSE 기반 알림
- 토스트 알림
- 알림 배지

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
- 대용량 리스트 가상화
- 무한 스크롤
- 성능 모니터링

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
