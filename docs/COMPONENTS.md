# SnapFit 컴포넌트 문서

## 개요

SnapFit의 UI 컴포넌트는 shadcn/ui를 기반으로 하며, 일관된 디자인 시스템을 제공합니다.

## 디자인 시스템

### 색상 팔레트
```css
/* Primary Colors */
--primary: 222.2 84% 4.9%;
--primary-foreground: 210 40% 98%;

/* Secondary Colors */
--secondary: 210 40% 96%;
--secondary-foreground: 222.2 84% 4.9%;

/* Accent Colors */
--accent: 210 40% 96%;
--accent-foreground: 222.2 84% 4.9%;

/* Destructive Colors */
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
```

### 타이포그래피
```css
/* Font Family */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;

/* Font Sizes */
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
--font-size-4xl: 2.25rem;
```

### 간격 시스템
```css
/* Spacing */
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-3: 0.75rem;
--spacing-4: 1rem;
--spacing-5: 1.25rem;
--spacing-6: 1.5rem;
--spacing-8: 2rem;
--spacing-10: 2.5rem;
--spacing-12: 3rem;
```

## 기본 컴포넌트

### Button
```tsx
import { Button } from '@/components/ui/button';

// 기본 버튼
<Button>클릭하세요</Button>

// 변형
<Button variant="outline">아웃라인</Button>
<Button variant="ghost">고스트</Button>
<Button variant="destructive">삭제</Button>

// 크기
<Button size="sm">작은 버튼</Button>
<Button size="lg">큰 버튼</Button>

// 아이콘과 함께
<Button>
  <Plus className="w-4 h-4 mr-2" />
  추가하기
</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/input';

// 기본 입력
<Input placeholder="입력하세요" />

// 에러 상태
<Input className="border-red-500" />

// 비밀번호 입력
<Input type="password" />
```

### Card
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>카드 제목</CardTitle>
  </CardHeader>
  <CardContent>
    카드 내용
  </CardContent>
</Card>
```

### Badge
```tsx
import { Badge } from '@/components/ui/badge';

<Badge>기본</Badge>
<Badge variant="secondary">보조</Badge>
<Badge variant="destructive">경고</Badge>
<Badge variant="outline">아웃라인</Badge>
```

## 복합 컴포넌트

### ProductGrid
```tsx
import { ProductGrid } from '@/components/ui/ProductGrid';

<ProductGrid 
  category="전체"
  gender="all"
  mainCategory="상의"
  subCategory="티셔츠"
/>
```

**Props:**
- `category`: 선택된 카테고리
- `gender`: 성별 필터
- `mainCategory`: 대분류 카테고리
- `subCategory`: 소분류 카테고리

### CategoryChips
```tsx
import { CategoryChips } from '@/components/ui/CategoryChips';

<CategoryChips
  selectedCategory="전체"
  onCategoryChange={setSelectedCategory}
  selectedGender="all"
  selectedMainCategory="상의"
  selectedSubCategory="티셔츠"
  onCategorySelect={handleCategorySelect}
/>
```

**Props:**
- `selectedCategory`: 선택된 카테고리
- `onCategoryChange`: 카테고리 변경 핸들러
- `selectedGender`: 선택된 성별
- `selectedMainCategory`: 선택된 대분류
- `selectedSubCategory`: 선택된 소분류
- `onCategorySelect`: 카테고리 선택 핸들러

### CategoryTab
```tsx
import { CategoryTab } from '@/components/category-tab';

<CategoryTab
  categories={['전체', '상의', '하의', '신발']}
  selectedCategory="상의"
  onCategoryChange={(category) => console.log(category)}
/>
```

**Props:**
- `categories`: 카테고리 목록
- `selectedCategory`: 선택된 카테고리
- `onCategoryChange`: 카테고리 변경 핸들러

### NotificationBadge
```tsx
import { NotificationBadge } from '@/features/notifications/NotificationBadge';

<NotificationBadge
  unreadCount={5}
  onClick={() => console.log('알림 클릭')}
/>
```

**Props:**
- `unreadCount`: 읽지 않은 알림 개수
- `onClick`: 클릭 이벤트 핸들러

## 레이아웃 컴포넌트

### HeaderNav
```tsx
import { HeaderNav } from '@/components/HeaderNav';

<HeaderNav
  user={user}
  onLogin={() => console.log('로그인')}
  onLogout={() => console.log('로그아웃')}
/>
```

### BottomTabBar
```tsx
import { BottomTabBar } from '@/components/ui/BottomTabBar';

<BottomTabBar
  activeTab="home"
  onTabChange={setActiveTab}
/>
```

### BottomTabBarWrapper
```tsx
import { BottomTabBarWrapper } from '@/components/ui/BottomTabBarWrapper';

<BottomTabBarWrapper />
```

**기능:**
- 현재 경로에 따라 자동으로 활성 탭 설정
- 모든 페이지에서 일관된 네비게이션 제공
- 홈, 좋아요, 커뮤니티, 코디, 마이페이지 탭 지원

## 폼 컴포넌트

### ProductForm
```tsx
import { ProductForm } from '@/components/product-form';

<ProductForm
  product={product}
  onSubmit={(data) => console.log(data)}
  onCancel={() => console.log('취소')}
/>
```

### UserProfileForm
```tsx
import { UserProfileForm } from '@/components/user-profile-form';

<UserProfileForm
  user={user}
  onSubmit={(data) => console.log(data)}
/>
```

## 코디 플레이그라운드 컴포넌트

### CodyPlayground
```tsx
import { CodyPlayground } from '@/components/cody-playground';

<CodyPlayground />
```

**기능:**
- 3단계 코디 프로세스 (상품 선택 → 코디 구성 → 완성)
- Framer Motion 애니메이션
- 상품 선택 및 조합 관리

### CodyHeader
```tsx
import { CodyHeader } from '@/components/cody-playground/CodyHeader';

<CodyHeader 
  currentStep={0}
  onBack={handleBack}
/>
```

### CodyStepIndicator
```tsx
import { CodyStepIndicator } from '@/components/cody-playground/CodyStepIndicator';

<CodyStepIndicator 
  currentStep={0}
  steps={['상품 선택', '코디 구성', '완성']}
/>
```

## 모달 컴포넌트

### AuthModal
```tsx
import { AuthModal } from '@/components/AuthModal';

<AuthModal
  isOpen={isOpen}
  mode="login" // 'login' | 'signup'
  onClose={() => setIsOpen(false)}
  onSwitchMode={(mode) => setMode(mode)}
/>
```

### ProductDetailModal
```tsx
import { ProductDetailModal } from '@/components/ProductDetailModal';

<ProductDetailModal
  product={product}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onAddToCart={(product) => console.log(product)}
/>
```

## 로딩 컴포넌트

### SkeletonLoader
```tsx
import { SkeletonLoader } from '@/shared/ui/SkeletonLoader';

// 텍스트 스켈레톤
<SkeletonLoader variant="text" lines={3} />

// 카드 스켈레톤
<SkeletonLoader variant="card" />

// 원형 스켈레톤
<SkeletonLoader variant="circular" width={40} height={40} />
```

### LoadingSpinner
```tsx
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';

<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />
```

## 에러 컴포넌트

### ErrorView
```tsx
import { ErrorView } from '@/shared/ui/ErrorView';

<ErrorView
  title="오류가 발생했습니다"
  message="잠시 후 다시 시도해주세요"
  onRetry={() => console.log('재시도')}
  onGoHome={() => console.log('홈으로')}
/>
```

### EmptyView
```tsx
import { EmptyView } from '@/shared/ui/EmptyView';

<EmptyView
  title="데이터가 없습니다"
  message="표시할 내용이 없습니다"
  action={{
    label: '새로 만들기',
    onClick: () => console.log('새로 만들기')
  }}
/>
```

## 접근성

### ARIA 속성
모든 컴포넌트는 적절한 ARIA 속성을 포함합니다:

```tsx
<Button
  aria-label="상품 좋아요"
  aria-pressed={isLiked}
  onClick={handleLike}
>
  <Heart className={isLiked ? 'fill-red-500' : ''} />
</Button>
```

### 키보드 네비게이션
- Tab 키로 포커스 이동
- Enter/Space 키로 액션 실행
- Escape 키로 모달 닫기

### 스크린 리더 지원
- 의미있는 라벨 제공
- 상태 변경 알림
- 역할 정보 제공

## 테마 지원

### 다크 모드
```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();

<div className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
  내용
</div>
```

### 테마 컨텍스트
```tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

<ThemeProvider>
  <App />
</ThemeProvider>
```

**기능:**
- localStorage에 테마 설정 저장
- 즉시 테마 적용 (새로고침 불필요)
- 다크/라이트 모드 토글

### 커스텀 테마
```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  /* 커스텀 색상 정의 */
}
```

## 성능 최적화

### 지연 로딩
```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

### 메모이제이션
```tsx
import { memo } from 'react';

const ProductCard = memo(({ product, onClick }) => {
  return (
    <div onClick={onClick}>
      {product.name}
    </div>
  );
});
```

## 테스트

### 컴포넌트 테스트
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/product-card';

test('상품 카드가 올바르게 렌더링된다', () => {
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
```

### 접근성 테스트
```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('접근성 규칙을 위반하지 않는다', async () => {
  const { container } = render(<ProductCard product={product} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```
