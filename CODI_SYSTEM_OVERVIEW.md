# SNAPFIT 코디 시스템 개요

본 문서는 SNAPFIT 프로젝트에 새로 추가된 **코디(Outfit) 시스템** 전반을 초보 개발자도 이해할 수 있도록 상세히 설명합니다. 

> **TIP**: 모르는 용어가 나오면 먼저 "왜 필요한가?" 를 생각해보세요. 아키텍처를 순서대로 읽으면 자연스럽게 연결됩니다.

---

## 1. 주요 기능 흐름

1. **카테고리 탭** – 사용자가 `tops / bottoms / shoes …` 과 같은 카테고리를 클릭 → `useCategoryProducts` 훅이 `/api/products?category=...` 호출 ▶ 상품 리스트 렌더링.
2. **Drag & Drop** – `DraggableProduct` 를 아바타 캔버스(`AvatarCanvas`) 의 `DropZone` 으로 끌어다 놓기 ▶ `OutfitBuilderContext` 가 카테고리별 위치에 상품 저장.
3. **코디 저장** – `SaveOutfitButton` 클릭 → `useSaveOutfit` 훅이 `/api/outfits` 로 JSON(상품 위치‧썸네일) 전송 ▶ DB `outfits` 테이블에 저장.
4. **좋아요** – `LikeButton` 클릭 → 프론트 낙관적 UI 업데이트 → `/api/likes/toggle` 호출 → `likes` 테이블 업데이트.
5. **실시간 조회수** – 상품 페이지 진입 시 `ViewCounterService.increment()` → Redis Lua 스크립트로 조회수 증가 ▶ STOMP WebSocket 브로드캐스트 → `useViewCount` 훅이 화면에 `n명이 보고 있어요` 표시.
6. **장바구니** – `AddToCartButton` 클릭 → `CartContext` 가 LocalStorage 에 담기 ▶ `CartPage` 에서 목록+총액 확인.

---

## 2. 백엔드 (Spring Boot)

### 2.1 엔티티 & 테이블

| 도메인 | 경로 | 설명 |
|--------|------|------|
| `Outfit` | `entity/Outfit.java` | 코디 JSON, 썸네일, 공개여부, 작성자 |
| `Like` | `entity/Like.java` | 대상 PK + 타입(ENUM) + 사용자/비회원 + createdAt |
| **[기존]** `Product`, `User`, … |  | 그대로 사용 |

`src/main/resources/db/migration/V2__create_outfits_and_likes.sql` 에 Flyway 스크립트가 있습니다.

### 2.2 Service & Controller

| 기능 | 서비스 | Controller API |
|------|--------|----------------|
| 코디 CRUD | `OutfitService` | `POST /api/outfits` , `PUT /api/outfits/{id}` , `DELETE /api/outfits/{id}` |
| 공개 코디 목록 | `listPublicOutfits()` | `GET /api/outfits/public` *(TODO 추가 가능)* |
| 좋아요 토글 & 카운트 | `LikeService` | `POST /api/likes/toggle` , `GET /api/likes/count`, `GET /api/likes/my` |
| 상품 상세 + 조회수 | `ProductService.getProductDetail` | `GET /api/products/{id}` (PublicProductController) |
| 조회수 증가 | `ViewCounterService.increment` | 위 상세 API 진입 시 자동 호출 |

> **권한 처리** – `CustomOAuth2User` 로부터 `User` 찾기 → 본인 확인.

### 2.3 Redis & 실시간

* **설정** : `RedisConfig` (Lettuce + `RedisTemplate<String,Long>`)
* **Lua 스크립트** : `incr_with_ttl.lua`
  ```lua
  -- 1) 키 조회수 +1, 2) 처음이면 TTL 설정
  redis.call('incr', KEYS[1])
  ```
* **WebSocket** : STOMP `/ws` 엔드포인트 → `ViewCounterService` 가 `/topic/views/{key}` 로 브로드캐스트.

---

## 3. 프론트엔드 (Next.js / React)

### 3.1 주요 훅 & 컨텍스트

| 훅/컨텍스트 | 경로 | 역할 |
|--------------|------|------|
| `useCategoryProducts` | `src/hooks` | 카테고리별 상품 fetch |
| `OutfitBuilderContext` | `src/contexts` | Drag&Drop 로 배치된 상품 상태 |
| `useSaveOutfit` | `src/hooks` | 코디 저장 API 호출 |
| `useToggleLike` | `src/hooks` | 좋아요 낙관적 토글 |
| `useViewCount` | `src/hooks` | STOMP 구독 후 실시간 카운트 수신 |
| `CartContext` | `src/contexts` | LocalStorage 기반 장바구니 상태 |
| `useMyLikes` | `src/hooks` | `/api/likes/my` 목록 호출 |

### 3.2 주요 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `CategoryTab` | 카테고리 선택 탭 |
| `AvatarCanvas` | Three.js 아바타 및 Stage |
| `DraggableProduct` | 상품 카드 (React-DND drag source) |
| `DropZone` | 아바타 위치별 drag target |
| `SaveOutfitButton` | 코디 저장 버튼 |
| `LikeButton` | 좋아요 하트 + 카운트 |
| `ViewCountDisplay` | "n명이 보고 있어요" 텍스트 |
| `AddToCartButton` / `CartPage` | 장바구니 기능 |
| `LikedProductsPage` | 마이페이지 상품 좋아요 목록 |

### 3.3 위치 매핑

`constants/position-map.ts`
```ts
export const POSITION_MAP = {
  tops: [0, 1.4, 0.1],
  bottoms: [0, 0.7, 0.1],
  shoes: [0, 0.1, 0.1],
  outer: [0, 1.5, 0.05],
};
```
`DropZone` 가 해당 좌표에 HTML overlay 를 띄워 이미지를 표시합니다.

---

## 4. 데이터 흐름 다이어그램 (텍스트 버전)

```
사용자 클릭 → CategoryTab → useCategoryProducts ─┐
                                                │ 상품 카드 (+DraggableProduct)
DraggableProduct ──drag──▶ DropZone → OutfitBuilderContext (배치 상태)
                                                    │
Save 버튼 → useSaveOutfit → POST /api/outfits → DB (outfits)

상품 상세 진입 → ViewCounterService.increment → Redis(INCR) + STOMP 브로드캐스트
        ↑                                 ↓
   useViewCount (WebSocket) ←── /topic/views/product:{id}:views

Like 버튼 → useToggleLike → POST /api/likes/toggle → likes 테이블

AddToCart → CartContext(LocalStorage) → CartPage 총액 계산
```

---

## 5. 개발 및 테스트 가이드

1. **백엔드 실행**: `cd snapfit-backend && ./gradlew bootRun`
2. **프론트엔드 실행**: `npm run dev`  (루트)
3. **전체 동시 실행**: `npm start` (concurrently)
4. **단위 테스트**: `./gradlew test` – 현재 JPA 도메인 위주, 필요 시 Mockito 작성.
5. **환경**: Postgres 15, Redis 7 (DockerCompose)

---

## 6. TODO / 개선 아이디어

- [ ] Redis 조회수 → 배치 스케줄러로 DB 반영 (`task-redis-scheduler-flush`)
- [ ] End-to-End 테스트 (`task-test-e2e-outfit-flow`)
- [ ] Swagger 자동 문서 (`task-docs-swagger-update`)
- [ ] 아바타 GLB 모델 교체 & Material 설정
- [ ] 결제(PG) 모듈 연동 시 `CartPage → Checkout` 플로우 확장

---

## 7. 마무리

이 문서는 신규 개발자가 코디 시스템의 **전체 흐름을 빠르게 파악**하도록 작성되었습니다. 

* **백엔드** – Spring Boot + JPA + Redis + WebSocket
* **프론트엔드** – Next.js 14 + Three.js + React-DND + STOMP

궁금한 사항이나 개선 제안이 있다면 TODO 목록에 이슈를 추가해 주세요. 즐거운 코딩 되세요! ✨ 