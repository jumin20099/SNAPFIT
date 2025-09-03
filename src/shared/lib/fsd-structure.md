# FSD (Feature-Sliced Design) 아키텍처 구조

## 폴더 구조

```
src/
├── shared/           # 공통 유틸리티, UI 컴포넌트, 라이브러리
│   ├── api/         # API 클라이언트, 타입 정의
│   ├── ui/          # 재사용 가능한 UI 컴포넌트
│   ├── lib/         # 유틸리티 함수, 설정
│   └── constants/   # 상수 정의
├── entities/        # 비즈니스 엔티티 (도메인 모델)
│   ├── product/     # 상품 엔티티
│   ├── user/        # 사용자 엔티티
│   ├── cody/        # 코디 엔티티
│   └── modal/       # 모달 엔티티
├── features/        # 기능별 모듈
│   ├── product-search/    # 상품 검색
│   ├── product-like/      # 상품 좋아요
│   ├── cody-builder/      # 코디 빌더
│   ├── user-auth/         # 사용자 인증
│   └── notifications/     # 알림
├── widgets/         # 복합 컴포넌트 (페이지 레벨)
│   ├── product-grid/      # 상품 그리드
│   ├── category-tabs/     # 카테고리 탭
│   ├── header-nav/        # 헤더 네비게이션
│   └── bottom-tab-bar/    # 하단 탭바
└── app/            # 라우팅, 레이아웃, 글로벌 설정
    ├── (routes)/   # Next.js 13+ App Router
    ├── layout.tsx
    └── globals.css
```

## 레이어 규칙

### 1. shared (공통)
- 다른 모든 레이어에서 사용 가능
- 비즈니스 로직 없음
- 순수한 유틸리티, UI 컴포넌트, 타입 정의

### 2. entities (엔티티)
- 비즈니스 도메인 모델
- shared에서만 import 가능
- 다른 entities와는 독립적

### 3. features (기능)
- 특정 기능 구현
- shared, entities에서 import 가능
- 다른 features와는 독립적

### 4. widgets (위젯)
- 복합 컴포넌트
- shared, entities, features에서 import 가능
- 다른 widgets와는 독립적

### 5. app (애플리케이션)
- 라우팅, 레이아웃
- 모든 레이어에서 import 가능
- 애플리케이션 진입점

## 마이그레이션 계획

1. **Phase 1**: shared 레이어 구축
   - API 클라이언트, 타입 정의
   - 공통 UI 컴포넌트
   - 유틸리티 함수

2. **Phase 2**: entities 레이어 구축
   - 도메인 모델 정의
   - 비즈니스 로직 분리

3. **Phase 3**: features 레이어 구축
   - 기능별 모듈 분리
   - 컨테이너/프리젠테이션 패턴 적용

4. **Phase 4**: widgets 레이어 구축
   - 복합 컴포넌트 분리
   - 페이지 레벨 컴포넌트 정리

5. **Phase 5**: app 레이어 정리
   - 라우팅 구조 최적화
   - 레이아웃 컴포넌트 정리
