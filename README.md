# SnapFit - 패션 커뮤니티 플랫폼

## 🚀 프로젝트 개요

SnapFit은 패션을 좋아하는 사람들을 위한 커뮤니티 플랫폼입니다. 사용자들이 자신의 스타일을 공유하고, 다른 사람의 코디를 참고하며, 패션에 대한 이야기를 나눌 수 있습니다.

## 🏗️ 아키텍처

### Frontend
- **Next.js 14** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Radix UI** - 접근성이 뛰어난 UI 컴포넌트

### Backend
- **Spring Boot 3** - Java 기반 백엔드 프레임워크
- **PostgreSQL** - 관계형 데이터베이스
- **Redis** - 캐싱 및 세션 관리
- **JWT** - 인증 및 권한 관리

### 실시간 통신
- **SSE (Server-Sent Events)** - HTTP 기반 실시간 알림 시스템
- **WebSocket 제거** - 복잡한 양방향 통신 대신 간단한 단방향 통신 사용

## ✨ 주요 기능

### 🔐 인증 시스템
- 카카오 OAuth2 로그인
- JWT 토큰 기반 인증
- 사용자 권한 관리

### 👕 상품 관리
- 상품 등록 및 관리
- 카테고리별 상품 분류
- 상품 검색 및 필터링
- 제휴사 상품 승인 시스템

### 💬 커뮤니티
- 게시글 작성 및 공유
- 좋아요 및 스크랩 기능
- 댓글 시스템
- 팔로우 기능

### 🔔 실시간 알림
- SSE 기반 실시간 알림
- 좋아요, 댓글, 팔로우 알림
- 자동 재연결 및 에러 처리

### 📊 관리자 기능
- 사용자 관리
- 상품 승인/거절
- 제휴사 신청 관리
- 통계 및 분석

## 🚀 시작하기

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL
- Redis

### Frontend 실행
```bash
npm install
npm run dev
```

### Backend 실행
```bash
cd snapfit-backend
./gradlew bootRun
```

## 🔧 기술적 특징

### SSE (Server-Sent Events) 사용 이유
- **단방향 통신**: 알림은 서버→클라이언트만 필요
- **HTTP 기반**: 기존 인증/세션 시스템과 완벽 호환
- **자동 재연결**: 브라우저가 자동으로 처리
- **간단한 구현**: 복잡한 프로토콜 불필요
- **가벼움**: WebSocket보다 오버헤드 적음

### WebSocket에서 SSE로 변경한 이유
1. **복잡성 감소**: STOMP 프로토콜, 메시지 브로커 등 불필요
2. **안정성 향상**: HTTP 기반으로 더 안정적인 연결
3. **유지보수성**: 코드가 더 간단하고 이해하기 쉬움
4. **성능**: 알림 전용으로 최적화된 프로토콜

## 📁 프로젝트 구조

```
snapfit/
├── app/                    # Next.js 앱 라우터
├── src/
│   ├── components/         # React 컴포넌트
│   ├── hooks/             # 커스텀 훅
│   ├── contexts/          # React 컨텍스트
│   └── types/             # TypeScript 타입 정의
├── snapfit-backend/        # Spring Boot 백엔드
│   └── src/main/java/
│       └── com/snapfit/
│           ├── api/        # REST API 컨트롤러
│           ├── service/    # 비즈니스 로직
│           ├── entity/     # JPA 엔티티
│           └── config/     # 설정 클래스
└── tests/                  # E2E 테스트
```

## 🧪 테스트

### E2E 테스트
```bash
npm run test:e2e
```

### 백엔드 테스트
```bash
cd snapfit-backend
./gradlew test
```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
