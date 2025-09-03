# ESLint 규칙 가이드

## 핵심 규칙

### TypeScript 관련
- `@typescript-eslint/no-explicit-any`: `any` 타입 사용 금지
- `@typescript-eslint/no-unused-vars`: 사용하지 않는 변수 제거
- `@typescript-eslint/prefer-const`: 재할당되지 않는 변수는 `const` 사용

### React 관련
- `react-hooks/rules-of-hooks`: 훅 규칙 준수
- `react-hooks/exhaustive-deps`: 의존성 배열 완성
- `react/prop-types`: TypeScript 사용 시 불필요

### 접근성 관련
- `jsx-a11y/alt-text`: 이미지에 alt 속성 필수
- `jsx-a11y/aria-props`: ARIA 속성 올바른 사용
- `jsx-a11y/role-has-required-aria-props`: 역할에 필요한 ARIA 속성

### 보안 관련
- `security/detect-object-injection`: 객체 주입 공격 방지
- `security/detect-unsafe-regex`: 안전하지 않은 정규식 사용 금지
- `security/detect-eval-with-expression`: eval 사용 금지

### Import 관련
- `import/order`: import 순서 정리
- `import/no-unresolved`: 해결되지 않은 import 금지
- `import/no-cycle`: 순환 import 금지

### Next.js 관련
- `@next/next/no-img-element`: `<img>` 대신 `<Image>` 사용
- `@next/next/no-html-link-for-pages`: Next.js Link 컴포넌트 사용
- `@next/next/no-sync-scripts`: 동기 스크립트 사용 금지

## 규칙 예외 처리

### 테스트 파일
```javascript
// 테스트 파일에서는 일부 규칙 완화
"@typescript-eslint/no-explicit-any": "off",
"no-console": "off",
```

### 설정 파일
```javascript
// 설정 파일에서는 CommonJS 허용
"@typescript-eslint/no-var-requires": "off",
"import/no-commonjs": "off",
```

## 사용법

### 특정 라인에서 규칙 비활성화
```javascript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response.data;
```

### 특정 파일에서 규칙 비활성화
```javascript
/* eslint-disable @typescript-eslint/no-explicit-any */
```

### 특정 규칙만 비활성화
```javascript
/* eslint-disable-next-line security/detect-object-injection */
const value = obj[key];
```

## 자동 수정

```bash
# 자동 수정 가능한 규칙들 수정
npm run lint -- --fix

# 특정 파일만 수정
npm run lint -- --fix src/components/ProductCard.tsx
```

## IDE 설정

### VS Code
```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 성능 최적화

### 규칙별 성능 영향
- `import/no-cycle`: 높음 (의존성 그래프 분석)
- `security/detect-*`: 중간 (정적 분석)
- `@typescript-eslint/*`: 낮음 (TypeScript 컴파일러 활용)

### 권장 설정
```javascript
// 성능을 위해 일부 규칙을 warn으로 설정
"security/detect-object-injection": "warn",
"import/no-cycle": "warn",
```
