// ========================================
// SnapFit 통합 타입 정의
// ========================================

// 기본 상품 타입
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  tags: string[];
  // 추가 필드들
  productIdx?: number;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  majorCategory?: string;
  subCategory?: string;
  storeName?: string;
  storeIdx?: number;
  // 평점 및 리뷰 필드들 (추후 구축 예정)
  rating?: number;
  reviewCount?: number;
  // API 호환성을 위한 필드들
  product_id?: string;
  product_idx?: number;
  product_name?: string;
  product_price?: number;
  product_image?: string;
  major_category?: string;
  sub_category?: string;
  store_name?: string;
  rating_score?: number;
  review_count?: number;
  // 날짜 필드들
  createdAt?: string;
  created_at?: string;
  // 좋아요 관련 필드들
  isLiked?: boolean;
  likeCount?: number;
}

// 사용자 타입
export interface User {
  id: string;
  userId?: number;
  userIdx?: number;
  email: string;
  nickname: string;
  profileImage?: string;
  provider?: string;
  providerId?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 상점 타입
export interface Store {
  storeIdx: number;
  storeName: string;
  storeDescription?: string;
  storeImage?: string;
  storeLogo?: string;
  storeLink?: string;
  contact?: string;
  royaltyRate?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 카테고리 타입
export interface Category {
  id: string;
  name: string;
  label: string;
  icon?: any;
  major?: string;
  sub?: string;
}

// 코디 관련 타입
export type CodySlot = 'hat' | 'top' | 'bottom' | 'outer' | 'shoes' | 'bag' | 'acc' | 'ring' | 'bracelet';

export interface CodyItem {
  id: number;
  name: string;
  image: string;
  slot: CodySlot;
  category?: string;
  price?: number;
  brand?: string;
}

export interface CodyState {
  items: Partial<Record<CodySlot, CodyItem>>;
  codyItems: Partial<Record<CodySlot, CodyItem>>; // Deprecated alias
}

// 알림 타입
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId?: number;
}

// 게시글 타입
export interface Post {
  id: number;
  postId?: number;
  authorId: number;
  content: string;
  mediaUrls?: string[];
  likeCount: number;
  commentCount: number;
  scrapCount: number;
  viewCount: number;
  isDeleted: boolean;
  isSponsored: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
  tags?: Tag[];
  outfitId?: number;
}

// 태그 타입
export interface Tag {
  id: number;
  tagId?: number;
  name: string;
  postCount?: number;
  createdAt?: string;
}

// 댓글 타입
export interface Comment {
  id: number;
  commentId?: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

// 좋아요/스크랩 타입
export interface Like {
  id: number;
  userId: number;
  targetId: number;
  targetType: 'product' | 'post' | 'comment';
  createdAt: string;
}

export interface Scrap {
  id: number;
  userId: number;
  targetId: number;
  targetType: 'product' | 'post';
  createdAt: string;
}

// 배치 반응 상태 타입 정의 (실무 기준)
export interface ReactionStatusItem {
  liked: boolean;
  likeCount: number;
  scraped?: boolean;
  scrapCount?: number;
}

export type BatchReactionStatusKeys = 
  | `product_${string}` 
  | `post_${string}` 
  | `comment_${string}`;

export type BatchReactionStatusResult = {
  [K in BatchReactionStatusKeys]?: ReactionStatusItem;
};

// 타입 안전한 배치 상태 접근 유틸리티
export interface BatchReactionStatusUtils {
  getProductStatus(productId: string | number): ReactionStatusItem | undefined;
  getPostStatus(postId: string | number): ReactionStatusItem | undefined;
  getCommentStatus(commentId: string | number): ReactionStatusItem | undefined;
}

// 팔로우 타입
export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 에러 타입
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// 폼 타입
export interface ProductFormData {
  name: string;
  price: number;
  category: string;
  brand: string;
  description?: string;
  images?: File[];
  tags?: string[];
}

export interface UserFormData {
  email: string;
  nickname: string;
  profileImage?: File;
}

// 검색 타입
export interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  tags?: string[];
  sortBy?: 'price' | 'name' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// 필터 타입
export interface FilterOptions {
  categories: Category[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  tags: string[];
}

// 정렬 옵션 타입
export interface SortOption {
  value: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

// 페이지네이션 타입
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 로딩 상태 타입
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// 모달 타입
export enum ModalType {
  None = 'None',
  Login = 'Login',
  Signup = 'Signup',
  ProductDetail = 'ProductDetail',
  CodyBuilder = 'CodyBuilder',
  Cart = 'Cart',
  Confirm = 'Confirm',
  Alert = 'Alert',
}

export interface ModalState {
  type: ModalType;
  props?: Record<string, any>;
}

// 테마 타입
export type Theme = 'light' | 'dark' | 'system';

// 로컬 스토리지 키 타입
export const STORAGE_KEYS = {
  THEME: 'snapfit-theme',
  USER_PREFERENCES: 'snapfit-user-preferences',
  RECENT_SEARCHES: 'snapfit-recent-searches',
  CART_ITEMS: 'snapfit-cart-items',
} as const;

// 환경 변수 타입
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_GA_ID?: string;
}

// 유틸리티 타입들
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 이벤트 타입들
export interface CustomEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

// SSE 이벤트 타입
export interface SSEEvent {
  type: 'notification' | 'like' | 'comment' | 'follow' | 'system';
  data: any;
  timestamp: number;
}

// 성능 메트릭 타입
export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

// 분석 이벤트 타입
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

// 사이즈 관련 타입들
export interface SizeVariant {
  sizeVariantId: number;
  productId: number;
  sizeLabel: string;
  sizeValue?: string;
  sku?: string;
  additionalPrice: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // 계산된 필드들
  totalStock: number;
  availableStock: number;
  inStock: boolean;
  lowStock: boolean;
  inventories?: Inventory[];
}

export interface Inventory {
  inventoryId: number;
  sizeVariantId: number;
  stockQuantity: number;
  safetyStock: number;
  reservedQuantity: number;
  lastRestockedAt?: string;
  createdAt: string;
  updatedAt: string;
  // 계산된 필드들
  availableQuantity: number;
  inStock: boolean;
  lowStock: boolean;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface SizeChart {
  sizeChartId: number;
  chartName: string;
  scopeType: 'BRAND' | 'CATEGORY' | 'PRODUCT';
  scopeValue?: string;
  chartData: string; // JSON 문자열
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
