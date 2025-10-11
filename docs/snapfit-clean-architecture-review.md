# Snapfit Clean Architecture & SOLID 진단

## 개요
- Next.js 프런트엔드와 Spring Boot 백엔드가 한 리포지터리에 공존하지만, 기능 흐름 기준으로 얽혀 있어 계층 간 경계가 흐립니다.
- 컨트롤러/컴포넌트가 인증·비즈니스 규칙·데이터 매핑을 직접 수행해 단일 책임 원칙과 의존성 역전 원칙을 위반하고 있습니다.
- DTO, 엔티티, 인프라 세부 구현이 경계를 넘어 노출되면서 변경이 전체로 전파되고, 테스트 격리도 어렵습니다.

이 문서는 현 코드에서 Clean Architecture와 SOLID 원칙을 깨뜨리는 대표적인 패턴을 짚고, 단계적 개선 방향을 제안합니다.

## 백엔드(Spring Boot)

### 주요 문제 징후
- **프리젠테이션 계층에 비즈니스 규칙 집중**  
  `snapfit-backend/src/main/java/com/snapfit/api/controller/PostController.java:26`는 JWT 파싱, 익명 사용자 인덱스 배정, Outfit 생성, 태그 정규화, 입력 검증을 모두 직접 처리합니다. 컨트롤러가 애플리케이션·도메인 정책을 품으면서 SRP가 깨지고, 테스트 및 재사용성이 떨어집니다.
- **상호 참조로 인해 의존성 역전 위반**  
  `snapfit-backend/src/main/java/com/snapfit/api/service/LikeService.java:25`가 `NotificationController`와 `NotificationService`를 동시에 의존하여 알림을 직접 전송합니다. 서비스 계층이 프리젠테이션 계층을 의존하면서 DIP가 붕괴되고, 교체와 테스트가 어렵습니다.
- **도메인 모델에 프레젠테이션 세부사항 누수**  
  `snapfit-backend/src/main/java/com/snapfit/api/entity/Post.java:63`처럼 엔티티에서 JSON 직렬화용 `@JsonProperty` 메서드를 노출합니다. 도메인 객체가 직렬화 책임을 함께 지니면서 ISP와 SRP가 동시에 깨집니다.
- **서비스 계층에서 Map/DTO 직접 조립**  
  `snapfit-backend/src/main/java/com/snapfit/api/service/CommunityService.java:43`는 Map을 반환하며 여러 리포지터리를 직접 호출합니다. 도메인 로직과 출력 포맷이 혼재돼 있고, 변경 시 서비스 전체가 수정 대상이 됩니다.
- **보안·세션 로직 중복**  
  `snapfit-backend/src/main/java/com/snapfit/api/controller/ScrapController.java:26`의 `current()`처럼 인증 객체를 재조회하는 코드가 여러 컨트롤러에 반복됩니다. 공통 관심사가 분리되지 않았습니다.

### 개선 방향
1. **애플리케이션 계층(Use Case) 구축**  
   - 컨트롤러는 DTO ↔ UseCase 호출만 담당하도록 축소합니다. 예: `CreatePostUseCase`, `ToggleLikeUseCase` 등을 정의하고, JWT 파싱·익명 정책·Outfit 매핑은 UseCase 내부로 이동합니다.
2. **포트·어댑터 도입으로 DIP 회복**  
   - 알림, 익명 인덱스 발급, 태그 통계 등 외부 의존성은 인터페이스(Port)로 추상화하고, 구현(Adaptor)을 인프라 계층에서 제공합니다. `LikeService`는 `NotificationGateway`에 의존하도록 바꿔 컨트롤러 상호 참조를 제거합니다.
3. **도메인 모델 정제**  
   - 엔티티에서 JSON 직렬화 메서드와 프레젠테이션 전용 필드를 제거하고, 응답 DTO/어댑터에서 매핑합니다. 도메인 객체는 불변 규칙과 비즈니스 메서드에 집중하게 만듭니다.
4. **쿼리 모델과 명령 모델 분리**  
   - 대시보드/통계 응답은 별도 Query 서비스와 DTO로 분리합니다. Command UseCase는 상태 변경, Query 핸들러는 조회로 역할을 명확히 합니다.
5. **공통 정책 추상화**  
   - 인증 사용자 조회, CSRF 검증, 예외 -> HTTP 변환을 글로벌 인터셉터/헬퍼에 모읍니다. 컨트롤러마다 반복되는 보일러플레이트를 제거하고, 정책 변경 시 단일 지점만 수정되도록 합니다.

## 프런트엔드(Next.js)

### 주요 문제 징후
- **페이지 컴포넌트에 데이터 로딩/인증/매핑 집중**  
  `app/scraps/page.tsx:41`는 로그인 상태 추정, API 호출, DTO → 뷰 모델 변환을 동시에 수행합니다. `any` 사용으로 타입 안정성이 무너지고, 유지보수가 어려운 커다란 컴포넌트가 됩니다.
- **API 연동이 전역 클라이언트에 종속**  
  `src/shared/api/client.ts:8`의 `ApiClient`는 환경 변수·CSRF 토큰·fetch 설정을 직접 관리합니다. 프런트 비즈니스 로직이 HTTP 세부 구현을 알아야 하므로 DIP가 위반됩니다.
- **Next API Routes가 단순 프록시 역할**  
  `app/api/notifications/route.ts:9`는 인증 토큰 추출, 백엔드 호출, 응답 전달을 반복하며 CSRF 유효성 검증을 호출하지 않습니다. 중복 코드가 많고, 실패 시 공통 처리도 없습니다.
- **상태·UI 결합으로 재사용 어려움**  
  `src/components/ui/HomePage.tsx:21`는 URL 파라미터 파싱, localStorage 조작, UI 렌더링을 한 파일에 묶어 SRP를 위반합니다.

### 개선 방향
1. **데이터 계층 분리**  
   - React Query/Hooks를 UseCase 형태로 래핑(`useScrapList`, `useNotificationsService`)하고, 컴포넌트는 뷰 렌더링만 담당하게 합니다.
2. **서버 컴포넌트/Route Handler 역할 명확화**  
   - 인증된 데이터는 서버 컴포넌트나 `Route Handler`가 검증 후 클라이언트 컴포넌트로 전달하도록 경계를 나눕니다. 토큰 추정 대신 명시적 세션 호출을 사용합니다.
3. **API 어댑터 추상화**  
   - `ApiClient`를 인터페이스로 분리하고, 테스트/실서비스 어댑터를 구분합니다. HTTP 세부 구현은 어댑터가 가져가고, 훅/서비스는 인터페이스에만 의존합니다.
4. **타입 안전성 강화**  
   - 서버 DTO에 대응하는 타입 정의(`ScrapResponse`, `NotificationDto`)를 생성해 `any` 제거 및 변경 영향도를 줄입니다.
5. **공통 인증/에러 핸들링 미들웨어화**  
   - Next middleware 또는 커스텀 fetch 래퍼로 인증 실패, CSRF 검증, 에러 로깅을 중앙집중화합니다.

## 공통 이슈
- **계층별 디렉터리 구조 미비**  
  기능별로 파일이 섞여 있어 의존성 방향이 불분명합니다. 백엔드는 `domain/app/infrastructure/interface`, 프런트는 `app/features/shared` 등 계층 기반으로 재조직이 필요합니다.
- **테스트 피라미드 부재**  
  도메인/애플리케이션 레벨 단위 테스트가 거의 없고, E2E에 의존합니다. 포트-어댑터 구조가 정립되면 유즈케이스 단위 테스트 작성이 쉬워집니다.
- **보일러플레이트 중복**  
  인증/로깅/에러 응답이 각 계층에 산재해 유지보수가 어렵습니다.

## 우선순위 로드맵
1. **아키텍처 경계 선언**  
   - 문서(예: `docs/architecture-guidelines.md`)에 목표 계층 구조와 의존 규칙을 명시하고 코드 소유자와 공유합니다.
2. **핵심 흐름부터 유즈케이스화**  
   - 게시글 생성/좋아요/스크랩 같은 핵심 기능을 UseCase + Port 구조로 리팩터링하며 테스트를 추가합니다.
3. **알림/반응 모듈 분리**  
   - 알림 전송을 도메인 이벤트/메시지 포트로 전환하고, SSE 어댑터는 인프라 계층에 한정시킵니다.
4. **프런트 데이터 계층 정리**  
   - 스크랩/알림 화면을 대상으로 훅/서비스/프리젠테이션 계층을 분리하고, 타입 정의와 에러 처리를 표준화합니다.
5. **자동화된 검증 추가**  
   - 아키텍처 테스트(ArchUnit, ESLint custom rule)로 금지 의존성을 감시하고, CI에 단위 테스트를 포함합니다.

위 단계들을 통해 모듈 간 결합도를 낮추고, 변화에 강한 구조로 전환할 수 있습니다.포츠/어댑터와 유즈케이스 중심 설계를 도입하면 팀 전체가 공통 규칙 아래에서 개발·릴리즈를 더 빠르고 안전하게 수행할 수 있습니다.
