# 스냅핏 E2E 테스트

이 폴더는 Playwright를 사용한 End-to-End 테스트를 포함합니다.

## 🚀 테스트 실행

### 전체 E2E 테스트 실행
```bash
npm run test:e2e
```

### 특정 테스트 파일 실행
```bash
npx playwright test tests/e2e/01.home-ui.spec.ts
```

### UI 모드로 테스트 실행 (브라우저에서 확인)
```bash
npx playwright test --ui
```

## 📁 테스트 파일 구조

### 00.health.spec.ts
- 백엔드 헬스체크 엔드포인트 테스트
- `/api/health` 응답 검증

### 01.home-ui.spec.ts
- 홈페이지 UI 스모크 테스트
- 카테고리 패널 열기/닫기
- 검색 기능 (디바운스 포함)
- 제휴신청 버튼 동작

### 02.products.spec.ts
- 상품 카테고리별 탐색
- 상품 상세 페이지 진입
- 조회수 증가 기능

### 03.likes.optional.spec.ts
- 좋아요 토글 기능 (인증 필요)
- 토큰이 없으면 테스트 스킵
- **주의**: 테스트 실행 전 localStorage에 'token' 값 필요

### 04.partner-and-admin.api.spec.ts
- 파트너 신청 API 테스트
- 파트너 상품 목록 API
- 어드민 승인 대기 목록 API
- 공개 상품 목록 API

### 05.search-api-routing.spec.ts
- 검색 API 라우팅 테스트
- 다양한 검색 타입별 검증
- 백엔드 프록시 동작 확인

### 06.product-detail-dto.spec.ts
- 상품 상세 DTO 스키마 검증
- 필수 필드 존재 여부 확인

## 🔧 테스트 환경 설정

### 사전 요구사항
1. **Docker**: PostgreSQL, Redis 컨테이너 실행
2. **백엔드**: Spring Boot 애플리케이션 실행 (포트 8080)
3. **프론트엔드**: Next.js 애플리케이션 실행 (포트 3000)

### 자동 환경 설정
```bash
npm run start:e2e
```
이 명령어는 다음을 자동으로 처리합니다:
- Docker 컨테이너 시작 (PostgreSQL, Redis)
- 포트 충돌 방지 (3000, 8080)
- 백엔드와 프론트엔드 동시 시작

## 🧪 테스트 커버리지

### ✅ 커버되는 기능
- 홈페이지 UI 및 네비게이션
- 카테고리별 상품 탐색
- 상품 검색 (디바운스 포함)
- 상품 상세 페이지
- 조회수 증가
- 파트너 신청 플로우
- 어드민 승인 시스템
- API 프록시 및 라우팅

### ⚠️ 제한사항
- **인증 필요 기능**: 좋아요, 마이페이지 등은 토큰 필요
- **토큰 발급**: 테스트용 JWT 발급 API가 없어 일부 기능 테스트 제한
- **데이터 의존성**: 테스트 상품 데이터가 DB에 있어야 함

### 🔑 인증 테스트를 위한 팁
1. **로컬 테스트**: 브라우저에서 로그인 후 localStorage의 'token' 값을 복사
2. **테스트 실행**: 테스트 실행 전 `localStorage.setItem('token', '복사한_토큰')` 설정
3. **토큰 유효성**: 백엔드 JWT 서명키와 일치해야 함

## 🐛 문제 해결

### 일반적인 문제들
1. **포트 충돌**: `lsof -ti :3000` 또는 `lsof -ti :8080`으로 확인
2. **Docker 컨테이너**: `docker ps`로 상태 확인
3. **백엔드 로그**: `snapfit-backend` 폴더에서 `./gradlew bootRun` 실행 시 로그 확인

### 디버깅 모드
```bash
# 헤드리스 모드 비활성화
npx playwright test --headed

# 디버그 모드
npx playwright test --debug

# 특정 테스트만 디버그
npx playwright test --debug tests/e2e/01.home-ui.spec.ts
```

## 📊 테스트 결과

테스트 실행 후 결과는 `test-results/` 폴더에 저장됩니다:
- HTML 리포트: `npx playwright show-report`
- 스크린샷: 실패한 테스트의 스크린샷
- 비디오: 테스트 실행 과정 녹화

## 🔄 지속적 통합

### GitHub Actions 예시
```yaml
- name: Run E2E Tests
  run: |
    npm run start:e2e &
    sleep 60  # 서비스 시작 대기
    npm run test:e2e
```

### 환경 변수
- `API_BASE_URL`: 백엔드 API 기본 URL
- `NEXT_PUBLIC_API_BASE_URL`: 프론트엔드에서 사용할 API URL
- `NEXT_PUBLIC_APP_ORIGIN`: 애플리케이션 원본 URL
