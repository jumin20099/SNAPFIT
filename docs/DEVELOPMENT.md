# SnapFit 개발 가이드

## 개발 환경 설정

### 필수 요구사항
- Node.js 18.17.0 이상
- npm 9.0.0 이상
- Git 2.30.0 이상
- Docker 20.10.0 이상 (백엔드 개발용)

### 프로젝트 클론 및 설치
```bash
# 저장소 클론
git clone https://github.com/snapfit/snapfit.git
cd snapfit

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

### 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CDN_URL=https://cdn.snapfit.app
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 개발 서버 실행

### 프론트엔드 개발 서버
```bash
# 개발 서버 시작
npm run dev

# 특정 포트로 실행
npm run dev -- -p 3001
```

### 백엔드 개발 서버
```bash
# Docker로 데이터베이스 실행
cd snapfit-backend
docker-compose up -d

# Spring Boot 애플리케이션 실행
./gradlew bootRun
```

## 코드 스타일

### ESLint 설정
```bash
# 린트 검사
npm run lint

# 자동 수정
npm run lint -- --fix
```

### Prettier 설정
```bash
# 코드 포맷팅
npx prettier --write .
```

### TypeScript 설정
- `strict: true` 모드 사용
- `any` 타입 사용 금지
- 명시적 타입 정의 필수

## 테스트

### 단위 테스트
```bash
# 모든 테스트 실행
npm run test

# 감시 모드로 실행
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

### E2E 테스트
```bash
# E2E 테스트 실행
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui

# 헤드리스 모드로 실행
npm run test:e2e:headed
```

### 테스트 작성 가이드
```tsx
// 컴포넌트 테스트 예시
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/product-card';

describe('ProductCard', () => {
  it('상품 정보가 올바르게 표시된다', () => {
    const product = {
      id: '1',
      name: '테스트 상품',
      price: 50000,
      imageUrl: 'https://example.com/image.jpg',
      category: '상의',
      brand: '테스트 브랜드',
      tags: ['인기']
    };

    render(<ProductCard product={product} />);
    
    expect(screen.getByText('테스트 상품')).toBeInTheDocument();
    expect(screen.getByText('₩50,000')).toBeInTheDocument();
  });

  it('클릭 시 상세 페이지로 이동한다', () => {
    const mockPush = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ push: mockPush });

    render(<ProductCard product={product} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockPush).toHaveBeenCalledWith('/products/1');
  });
});
```

## Git 워크플로우

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

### 커밋 메시지 규칙
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 스타일 수정
- `refactor`: 리팩터링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스 또는 보조 도구 변경

**예시:**
```
feat(product): 상품 좋아요 기능 추가

- 좋아요 버튼 클릭 시 API 호출
- 좋아요 상태 실시간 업데이트
- 에러 처리 및 로딩 상태 표시

Closes #123
```

### Pull Request 가이드
1. 기능 브랜치에서 개발 완료
2. 테스트 작성 및 통과 확인
3. 코드 리뷰 요청
4. 승인 후 메인 브랜치에 머지

## 성능 최적화

### 번들 분석
```bash
# 번들 분석 리포트 생성
npm run analyze
```

### 성능 측정
```bash
# Lighthouse 성능 측정
npm run lighthouse
```

### 이미지 최적화
```tsx
// Next.js Image 컴포넌트 사용
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="상품 이미지"
  width={300}
  height={300}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## 디버깅

### 개발자 도구
- React Developer Tools
- Redux DevTools
- TanStack Query DevTools

### 로깅
```tsx
// 개발 환경에서만 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('디버그 정보:', data);
}
```

### 에러 추적
```tsx
import { captureSentryError } from '@/shared/lib/sentry';

try {
  // 위험한 작업
} catch (error) {
  captureSentryError(error, {
    tags: { component: 'ProductCard' },
    extra: { productId: product.id }
  });
}
```

## 배포

### 스테이징 배포
```bash
# 스테이징 환경 빌드
npm run build:staging

# 스테이징 서버 배포
npm run deploy:staging
```

### 프로덕션 배포
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 배포
npm run deploy:production
```

## 모니터링

### 성능 모니터링
- Core Web Vitals 추적
- 번들 크기 모니터링
- API 응답 시간 측정

### 에러 모니터링
- Sentry를 통한 실시간 에러 추적
- 사용자 피드백 수집
- 성능 이슈 알림

## 문제 해결

### 일반적인 문제

#### 1. 빌드 실패
```bash
# 캐시 정리
rm -rf .next
npm run build
```

#### 2. 의존성 충돌
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript 에러
```bash
# 타입 체크
npm run type-check

# 타입 정의 업데이트
npm run generate:api
```

### 성능 문제

#### 1. 느린 페이지 로딩
- 이미지 최적화 확인
- 번들 크기 분석
- 코드 분할 적용

#### 2. 메모리 누수
- 컴포넌트 언마운트 시 정리
- 이벤트 리스너 제거
- 타이머 정리

## 도구 및 확장

### VS Code 확장
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

### 유용한 명령어
```bash
# 의존성 업데이트
npm update

# 보안 취약점 검사
npm audit

# 사용하지 않는 의존성 제거
npm prune

# 패키지 정보 확인
npm info <package-name>
```

## 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev)
- [TypeScript 문서](https://www.typescriptlang.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TanStack Query 문서](https://tanstack.com/query/latest)
- [Playwright 문서](https://playwright.dev)
