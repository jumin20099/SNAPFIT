# Snapfit 커뮤니티 시스템 개발 ToDo 리스트

## 🚀 P0: 기반 구축

### 데이터베이스 & 백엔드 기반
- [x] V20__community_core.sql 마이그레이션 파일 생성
- [x] Post.java 엔티티 클래스 생성 (posts 테이블)
- [x] Scrap.java 엔티티 클래스 생성 (scraps 테이블)
- [x] Follow.java 엔티티 클래스 생성 (follows 테이블)
- [x] Tag.java 엔티티 클래스 생성 (tags 테이블)
- [x] Comment.java 엔티티 클래스 생성 (comments 테이블)
- [x] Notification.java 엔티티 클래스 생성 (notifications 테이블)
- [x] Report.java 엔티티 클래스 생성 (reports 테이블)
- [x] Block.java 엔티티 클래스 생성 (blocks 테이블)

### 리포지토리 인터페이스
- [x] PostRepository.java 생성 (JPA CRUD + 커스텀 쿼리)
- [x] ScrapRepository.java 생성
- [x] FollowRepository.java 생성
- [x] TagRepository.java 생성
- [x] CommentRepository.java 생성
- [x] NotificationRepository.java 생성
- [x] ReportRepository.java 생성
- [x] BlockRepository.java 생성

## 🔧 P1: 핵심 기능 구현

### 서비스 레이어
- [ ] CommunityService.java 생성 (통합 커뮤니티 비즈니스 로직)
- [ ] PostService.java 생성 (게시글 CRUD, 태그 파싱)
- [ ] ScrapService.java 생성 (스크랩 토글, 조회)
- [ ] FollowService.java 생성 (팔로우/팔로잉 관리)
- [ ] TagService.java 생성 (태그 정규화, 트렌딩)
- [ ] CommentService.java 생성 (댓글 CRUD)
- [ ] SearchService.java 생성 (PostgreSQL 기반 통합 검색)

### 컨트롤러 레이어
- [ ] CommunityController.java 생성 (통합 커뮤니티 API)
- [ ] PostController.java 생성 (게시글 API 엔드포인트)
- [ ] ScrapController.java 생성 (스크랩 API)
- [ ] FollowController.java 생성 (팔로우 API)
- [ ] CommentController.java 생성 (댓글 API)
- [ ] SearchController.java 생성 (검색 API)

### 프론트엔드 API 연동
- [ ] useInfinitePosts.ts 훅 생성 (무한 스크롤)
- [ ] useCreatePost.ts 훅 생성 (게시글 생성)
- [ ] useToggleScrap.ts 훅 생성 (스크랩 토글)
- [ ] useToggleFollow.ts 훅 생성 (팔로우 토글)
- [ ] useComments.ts 훅 생성 (댓글 CRUD)
- [ ] useSearch.ts 훅 생성 (통합 검색)

## 🌟 P2: 소셜 기능 구현

### 랭킹 시스템
- [ ] RankingService.java 생성 (랭킹 점수 계산)
- [ ] 랭킹 알고리즘 v1 구현 (가중치 기반)
- [ ] Redis 캐시 연동 (랭킹 결과 60초 TTL)
- [ ] 프론트엔드 랭킹 탭 구현

### 팔로우 시스템
- [ ] 팔로우 기반 개인화 피드 구현
- [ ] 팔로우 추천 알고리즘 구현
- [ ] 프론트엔드 팔로우 탭 완성

### 알림 시스템
- [ ] WebSocket 알림 전송 구현
- [ ] 알림 타입별 처리 (좋아요, 댓글, 팔로우, 스크랩)
- [ ] notification-page.tsx 완성
- [ ] 실시간 알림 배지 업데이트

## 🛡️ P3: 안전 시스템 구축

### 신고 시스템
- [ ] 신고 처리 워크플로우 구현
- [ ] 게시글/댓글/사용자 신고 기능
- [ ] 어드민 대시보드 신고 처리 탭 추가
- [ ] 신고 통계 및 모니터링

### 차단 시스템
- [ ] 사용자 차단 기능 구현
- [ ] 차단된 사용자 컨텐츠 제외 로직
- [ ] 프론트엔드 차단/해제 UI
- [ ] 차단 관리 페이지

### 모더레이션
- [ ] 자동 키워드 필터링 구현
- [ ] 수동 모더레이션 워크플로우
- [ ] 신고 처리 SLA 설정

## ⚡ P4: 최적화 및 수익화

### 성능 최적화
- [ ] 이미지 Lazy Loading 구현 (IntersectionObserver)
- [ ] 컴포넌트 지연 로딩 구현
- [ ] Redis 캐싱 전략 최적화
- [ ] 데이터베이스 쿼리 성능 튜닝

### 검색 고도화
- [ ] 태그 기반 검색 개선
- [ ] 인기 태그 트렌딩 구현
- [ ] 사용자 행동 기반 검색 결과 개선
- [ ] 개인화 검색 결과 구현

### 수익화 기능
- [ ] 스폰서드 포스트 시스템 구현
- [ ] 명시적 라벨링 및 공정 노출
- [ ] 게시글 → 상품 상세 전환율 최적화
- [ ] 제휴 링크 추적 시스템

## 🧪 테스트 및 품질 관리
- [ ] 각 단계별 단위 테스트 작성
- [ ] E2E 테스트 시나리오 작성 (Playwright)
- [ ] 성능 테스트 (로딩 시간, 무한 스크롤)
- [ ] 보안 테스트 (XSS, CSRF, 권한 검사)
- [ ] 사용자 경험 테스트 (모바일, 데스크톱)

## 🚀 배포 및 모니터링
- [ ] 환경별 설정 파일 정리
- [ ] 로깅 및 모니터링 설정
- [ ] 에러 추적 시스템 연동
- [ ] 성능 메트릭 수집 및 대시보드

## 🎯 목표
**100억 매출을 목표로 하는 강력한 코디 공유 커뮤니티 시스템 구축**

## 🔥 우선순위
1. **P0**: 데이터베이스 스키마 및 백엔드 기반
2. **P1**: 핵심 기능 구현 및 API 연동
3. **P2**: 소셜 기능으로 사용자 참여 증폭
4. **P3**: 안전 시스템으로 신뢰성 확보
5. **P4**: 최적화 및 수익화로 비즈니스 가치 창출
