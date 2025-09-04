# SnapFit API 문서

## 개요

SnapFit API는 RESTful API 설계 원칙을 따르며, Next.js App Router의 API Routes를 통해 구현됩니다. 백엔드 Spring Boot API와 프론트엔드 Next.js API Routes가 함께 동작합니다.

## 기본 정보

- **Frontend API Base URL**: `http://localhost:3000/api`
- **Backend API Base URL**: `http://localhost:8080/api`
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer Token
- **Real-time**: Server-Sent Events (SSE)

## 인증

### JWT 토큰
```http
Authorization: Bearer <jwt_token>
```

### 토큰 갱신
```http
POST /api/auth/refresh
```

## 상품 API

### 상품 목록 조회
```http
GET /api/products
```

**Query Parameters:**
- `major` (string): 대분류 카테고리
- `sub` (string): 소분류 카테고리
- `page` (number): 페이지 번호 (기본값: 0)
- `size` (number): 페이지 크기 (기본값: 20)
- `sortBy` (string): 정렬 기준 (price, name, createdAt, likeCount)
- `sortOrder` (string): 정렬 순서 (asc, desc)

### 상품 검색
```http
GET /api/products/search
```

**Query Parameters:**
- `keyword` (string): 검색 키워드
- `type` (string): 검색 타입 (all, product, category)

### 최근 본 상품
```http
GET /api/products/recent
POST /api/products/recent
```

**Response:**
```json
{
  "content": [
    {
      "productIdx": 1,
      "productName": "테스트 상품",
      "productContent": "상품 설명",
      "productPrice": 50000,
      "productImage": "https://cdn.snapfit.app/images/product1.jpg",
      "majorCategory": "상의",
      "subCategory": "티셔츠",
      "storeIdx": 1,
      "storeName": "테스트 스토어",
      "isLiked": false,
      "likeCount": 10
    }
  ],
  "totalElements": 100,
  "totalPages": 5,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false
}
```

### 상품 상세 조회
```http
GET /api/products/{id}
```

**Response:**
```json
{
  "productIdx": 1,
  "productName": "테스트 상품",
  "productContent": "상품 설명",
  "productPrice": 50000,
  "productImage": "https://cdn.snapfit.app/images/product1.jpg",
  "majorCategory": "상의",
  "subCategory": "티셔츠",
  "storeIdx": 1,
  "storeName": "테스트 스토어",
  "brand": "테스트 브랜드",
  "tags": ["인기", "할인"],
  "isLiked": false,
  "likeCount": 10,
  "viewCount": 100,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 상품 검색
```http
GET /api/products/search
```

**Query Parameters:**
- `keyword` (string): 검색 키워드
- `type` (string): 검색 타입 (all, product, category)

**Response:**
```json
{
  "content": [
    {
      "productIdx": 1,
      "productName": "테스트 상품",
      "productPrice": 50000,
      "productImage": "https://cdn.snapfit.app/images/product1.jpg",
      "majorCategory": "상의"
    }
  ],
  "totalElements": 10,
  "totalPages": 1,
  "size": 20,
  "number": 0,
  "first": true,
  "last": true
}
```

## 좋아요 API

### 좋아요 토글
```http
POST /api/likes/toggle
Content-Type: application/json

{
  "targetIdx": 1,
  "targetType": "PRODUCT"
}
```

### 내 좋아요 목록
```http
GET /api/likes/my/posts
GET /api/likes/my/products
GET /api/likes/my/brands
```

### 좋아요한 상품/게시글 상세 정보
```http
POST /api/products/liked
POST /api/posts/liked
Content-Type: application/json

{
  "postIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "liked": true,
  "count": 11
}
```

## 스크랩 API

### 스크랩 토글
```http
POST /api/scraps/toggle
Content-Type: application/json

{
  "targetIdx": 1,
  "targetType": "POST"
}
```

### 내 스크랩 목록
```http
GET /api/scraps/my
```

**Response:**
```json
{
  "isScrapped": true,
  "scrapCount": 5
}
```

## 사용자 API

### 사용자 정보 조회
```http
GET /api/user/info
```

**Response:**
```json
{
  "userIdx": 1,
  "userName": "테스트 유저",
  "userProfileImage": "https://cdn.snapfit.app/images/profile1.jpg",
  "userBio": "안녕하세요",
  "followerCount": 100,
  "followingCount": 50,
  "postCount": 20
}
```

### 사용자 프로필 업데이트
```http
PATCH /api/user/profile
Content-Type: application/json

{
  "nickname": "새로운 닉네임",
  "profileImage": "https://example.com/profile.jpg"
}
```

### 프로필 이미지 업로드
```http
POST /api/media/upload/profile
Content-Type: multipart/form-data

image: [file]
```

## 알림 API

### 알림 목록 조회
```http
GET /api/notifications
```

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "like",
      "title": "새로운 좋아요",
      "message": "당신의 게시글에 좋아요가 눌렸습니다.",
      "timestamp": "2024-01-01T00:00:00Z",
      "read": false,
      "avatar": "https://cdn.snapfit.app/images/avatar1.jpg",
      "userName": "테스트 유저"
    }
  ],
  "unreadCount": 5
}
```

### 알림 읽음 처리
```http
PUT /api/notifications/{id}
Content-Type: application/json

{
  "isRead": true
}
```

### 모든 알림 읽음 처리
```http
POST /api/notifications/read-all
```

## 실시간 알림 (SSE)

### 알림 스트림 연결
```http
GET /api/notifications/stream
Accept: text/event-stream
```

**Event Format:**
```
data: {"id": 1, "type": "like", "title": "새로운 좋아요", "message": "당신의 게시글에 좋아요가 눌렸습니다.", "timestamp": "2024-01-01T00:00:00Z"}
```

## 커뮤니티 API

### 게시글 목록 조회
```http
GET /api/posts
```

**Query Parameters:**
- `size` (number): 페이지 크기 (기본값: 20)
- `page` (number): 페이지 번호 (기본값: 0)
- `sort` (string): 정렬 기준 (기본값: createdAt)

### 게시글 상세 조회
```http
GET /api/posts/{id}
```

### 게시글 댓글 조회
```http
GET /api/posts/{id}/comments
```

## 검색 API

### 통합 검색
```http
GET /api/search
```

**Query Parameters:**
- `q` (string): 검색어
- `page` (number): 페이지 번호 (기본값: 1)
- `limit` (number): 페이지 크기 (기본값: 20)

### 인기 검색어
```http
GET /api/search/popular
```

### 트렌딩 검색어
```http
GET /api/search/trending
```

## 관리자 API

### 파트너 신청 관리
```http
GET /api/admin/partner/applications
PATCH /api/admin/partner/applications/{id}/status
```

### 상품 승인 관리
```http
GET /api/admin/products
PATCH /api/admin/products/{id}/status
POST /api/admin/products/approvals
```

### 신고 관리
```http
GET /api/reports
PATCH /api/reports/{id}/status
```

## 파트너 API

### 파트너 신청
```http
POST /api/partner/application
```

### 파트너 대시보드
```http
GET /api/partner/dashboard
```

### 파트너 상품 관리
```http
GET /api/partner/products
POST /api/partner/products
```

## 에러 응답

### 표준 에러 형식
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      {
        "field": "productName",
        "message": "상품명은 필수입니다."
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/products"
}
```

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌
- `500`: 서버 오류

## Rate Limiting

- **일반 API**: 1000 requests/hour
- **인증 API**: 100 requests/hour
- **파일 업로드**: 100 requests/hour

## 버전 관리

API 버전은 URL 경로에 포함됩니다:
- v1: `/api/v1/products`
- v2: `/api/v2/products` (향후)

## SDK

### JavaScript/TypeScript
```typescript
import { SnapFitAPI } from '@snapfit/api-client';

const api = new SnapFitAPI({
  baseURL: 'https://api.snapfit.app',
  token: 'your-jwt-token'
});

// 상품 목록 조회
const products = await api.products.list({
  major: '상의',
  page: 0,
  size: 20
});

// 좋아요 토글
const result = await api.likes.toggle({
  targetIdx: 1,
  targetType: 'product'
});
```

## 테스트

### Postman Collection
- [SnapFit API Collection](./postman/SnapFit-API.postman_collection.json)

### OpenAPI Spec
- [OpenAPI 3.0 Spec](./openapi.yaml)

## 지원

- **문서**: https://docs.snapfit.app
- **지원**: support@snapfit.app
- **GitHub**: https://github.com/snapfit/api
