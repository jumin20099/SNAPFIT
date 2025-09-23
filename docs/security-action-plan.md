Security

application-dev.properties와 application.properties에 DB 계정, JWT 비밀키, 카카오 OAuth, AWS S3 자격 증명이 그대로 커밋돼 있습니다(snapfit-backend/src/main/resources/application-dev.properties:13, snapfit-backend/src/main/resources/application.properties:17). 공개 저장소나 공유된 저장소라면 즉시 노출된 비밀 제거와 키 롤테이션이 필요합니다.


Spring Security 설정이 사실상 모든 요청을 permitAll()로 열어 두고 JWT 필터를 주석 처리했습니다(snapfit-backend/src/main/java/com/snapfit/api/security/SecurityConfig.java:32). 인증/인가가 비활성화돼 있어 API가 누구에게나 노출됩니다.


AuthController가 카카오 토큰 교환 로직을 직접 처리하면서, 외부에서 주입된 OAuth 프로필을 신뢰하고 즉시 JWT를 발급합니다(snapfit-backend/src/main/java/com/snapfit/api/controller/AuthController.java:37). 입력 검증, state 파라미터 검증, CSRF 보호가 없습니다.


프론트에서 AWS 프록시 /api/image-proxy 경유 없이 S3 원본을 그대로 사용하고, S3 버킷이 public 권한이라는 전제이므로 이미지 링크가 쉽게 유출될 수 있습니다(src/components/cody-playground/NewCodyPlayground.tsx:824).



데이터/스토리지

Outfit 저장 시 outfitItem에 전체 JSON 문자열을 저장합니다(snapfit-backend/src/main/java/com/snapfit/api/service/OutfitService.java:33). 쿼리 최적화가 어려워지고, 백엔드에서 필터링하기 힘들어 지금처럼 전체 목록을 내려 보내 프런트가 필터링하는 구조가 되었습니다.



/api/outfits/product/{id}는 페이지네이션 요청에도 findByIsPublicTrueOrderByCreatedAtDesc() 전체를 반환하고 클라이언트에서 필터링하도록 합니다(snapfit-backend/src/main/java/com/snapfit/api/service/OutfitService.java:169). 데이터가 늘어날수록 메모리/DB 부하가 급증합니다.



Flyway 스크립트에 테스트 계정/상품이 그대로 포함돼 있어 환경 전환 시 실제 데이터베이스에 그대로 들어갈 위험이 있습니다(snapfit-backend/src/main/resources/db/migration/V5__add_test_products.sql:1 등).
퍼포먼스




프런트는 코디 썸네일을 볼 때마다 아이템 이미지 여러 개를 다시 로드하고 html2canvas로 렌더링합니다(src/components/product/OutfitSection.tsx:176, src/lib/image-utils.ts:392). 저장 시 S3에 썸네일을 올리긴 했지만, 기존 코디(썸네일 URL이 없는 경우)는 여전히 매번 캔버스를 실행합니다.




CodyDisplay는 코디 카드마다 모든 아이템의 /api/products/:id API를 순차로 호출합니다(src/components/ui/CodyDisplay.tsx:33). 코디 한 개에 N개의 네트워크 요청이 발생하며, 캐시가 없어 동일 API를 반복 호출합니다.




AssetMetaManager.loadImageMeta가 각 이미지마다 new Image() 로딩을 추가로 수행합니다(src/entities/cody/model.ts:102). 세션마다 반복되어, 썸네일 생성과 UI 렌더 시 중복 네트워크를 일으킵니다.




서버 로그에 console.log가 잔뜩 남아 있어 브라우저 콘솔을 오염시키고 렌더링 중 쓸데없는 I/O를 일으킵니다(예: src/lib/image-utils.ts:31, src/components/product/OutfitSection.tsx:214).




코드 품질/유지보수

백엔드 서비스는 검증/에러 처리가 부족합니다. 예: OutfitService.updateOutfit는 DTO의 outfitThumbnail을 null 체크만 하고 그대로 저장, 입력값 유효성 검증(길이, 비어 있음)이 전혀 없습니다(snapfit-backend/src/main/java/com/snapfit/api/service/OutfitService.java:53).




MediaUploadServiceImpl은 S3 업로드 실패 시 로컬 파일을 만들어 저장하고 DB에 URL을 기록합니다(snapfit-backend/src/main/java/com/snapfit/api/service/MediaUploadServiceImpl.java:64). 로컬 파일 제거 로직이 없어 특정 서버에 파일이 쌓이고, 복수 인스턴스 환경에서는 404 링크가 생길 수 있습니다.




프런트엔드에서 동일한 유틸리티를 여러 파일에 반복 정의합니다. 예: 상품 정보 표시는 CodyDisplay, MyCodyList 등 각 컴포넌트에서 별도 처리해 유지보수가 어렵습니다.



console log 기반 디버그 코드가 많아 실제 운영 환경에서 로그 관리가 어렵고 민감 데이터를 남길 위험이 있습니다.



DevOps/배포

scripts/dev-start.sh는 Gradle 빌드→bootRun→npm dev를 로컬에서 수행하면서 docker-compose를 자동 수행합니다(scripts/dev-start.sh:1). CI/CD 파이프라인과 분리되지 않았으며, 실행 중 실패 처리나 종료 시 정리가 미흡합니다.



app/docker-compose.yml이 없고 backend/docker-compose만 있어 프런트와 백엔드가 분리된 배포를 고려하지 않았습니다.



테스트 커버리지가 제한적입니다. 백엔드 테스트는 OutfitService 단일 케이스 뿐(snapfit-backend/src/test/java/com/snapfit/api/service/OutfitServiceTest.java:1). 프런트 e2e는 Playwright 스모크만 있고 CI에 통합되었다는 증거가 없습니다.




관측/로깅

Sentry 설정은 있지만(sentry.client.config.ts:1), 서버 측 로깅/모니터링 구성은 보이지 않습니다. Spring Boot 기본 로그 수준을 사용하며, 주요 서비스에서 try-catch 후 System.err.println을 사용하는 등 통합 로깅 설계가 없습니다.



NotificationService는 SSE 스트림 상태나 실패를 로깅하지만, rate limiting이나 재시도 제어가 구현되지 않았습니다(snapfit-backend/src/main/java/com/snapfit/api/service/NotificationService.java:41).




다음 단계 제안

보안 강화: 환경 변수/Secret Manager로 민감 정보 분리, Spring Security 재구성(JWT 필터 복구, 엔드포인트별 접근 제어). OAuth state 검증 추가.



데이터 액세스 최적화: Outfit 관련 API에 JPQL/QueryDSL로 필터링·페이지네이션 도입, 썸네일·상품 메타를 DTO로 함께 내려주는 합성 API 설계.



썸네일 파이프라인 단순화: 저장 시 생성한 S3 URL만 사용하도록 이전 코디 데이터를 마이그레이션하고, 프런트에서는 캔버스 렌더를 완전히 제거.



캐싱 도입: TanStack Query로 클라이언트 API 캐싱 구성, 서버 측 HTTP 캐시/Redis 도입. AssetMetaManager에 영구 캐시 저장.



테스트/모니터링: 핵심 서비스(Outfit, Media, Notification)에 단위·통합 테스트 추가. Spring Boot Actuator, APM, 로그 어그리게이터(ELK 등) 연결.



DevOps 개선: CI 파이프라인에서 lint/test/build 수행, docker-compose 대신 인프라 정의를 IaC로 분리. scripts/dev-start.sh는 개발 전용으로 명시.



클린업: console 로그 정리, Error handling·DTO 검증 추가, fallback 파일 정리 로직 개선 등 유지보수성 향상.
이러한 조치가 없다면 초기 트래픽만으로도 DB·네트워크 비용이 급증하고, 인증 없는 API가 악용되어 서비스 신뢰도에 문제가 생길 수 있습니다.