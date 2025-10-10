import { Product, Post, User, Store, Notification, ApiResponse, PaginatedResponse, SizeVariant } from './types';

// API 클라이언트 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // HttpOnly 쿠키 자동 전송
      ...options,
    };

    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, {
        url,
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // DELETE 요청의 경우 빈 응답이므로 JSON 파싱하지 않음
    if (options.method === 'DELETE' || response.status === 204) {
      return {} as T;
    }

    // 응답이 비어있는 경우 빈 객체 반환
    const text = await response.text();
    if (!text.trim()) {
      return {} as T;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn('JSON 파싱 실패, 빈 객체 반환:', error);
      return {} as T;
    }
  }

  // 상품 관련 API
  async getProductsByCategory(major: string, sub?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    
    // major가 'all'이 아닐 때만 파라미터에 추가
    if (major && major !== 'all') {
      params.append('major', major);
    }
    
    if (sub) params.append('sub', sub);
    
    const queryString = params.toString();
    const url = queryString ? `/api/products?${queryString}` : '/api/products';
    
    return this.request<Product[]>(url);
  }

  async getProductById(id: number): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`);
  }

  async searchProducts(keyword: string, type: string = 'all'): Promise<Product[]> {
    const params = new URLSearchParams({ keyword, type });
    return this.request<Product[]>(`/api/products/search?${params.toString()}`);
  }

  // 포스트 관련 API
  async getPosts(page: number = 0, size: number = 20): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      size: size.toString() 
    });
    return this.request<PaginatedResponse<Post>>(`/api/posts?${params.toString()}`);
  }

  async getPostById(id: number): Promise<Post> {
    return this.request<Post>(`/api/posts/${id}`);
  }

  async createPost(data: { content: string; imageUrl?: string }): Promise<Post> {
    return this.request<Post>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 좋아요 관련 API
  async toggleLike(targetIdx: number, targetType: 'product' | 'brand' | 'outfit' | 'post'): Promise<{ liked: boolean; count: number }> {
    const payloadType = targetType === 'post' ? 'POST' : targetType;
    return this.request<{ liked: boolean; count: number }>('/api/likes/toggle', {
      method: 'POST',
      body: JSON.stringify({ 
        targetIdx, 
        targetType: payloadType 
      }),
    });
  }

  // 스크랩 관련 API
  async toggleScrap(postId: number): Promise<{ scraped: boolean; count: number }> {
    return this.request<{ scraped: boolean; count: number }>('/api/scraps/toggle', {
      method: 'POST',
      body: JSON.stringify({ postId }),
    });
  }

  // 배치 상태 조회 API
  async getReactionStatus(postIds: number[]): Promise<Record<number, { liked: boolean; scraped: boolean; likeCount: number; scrapCount: number }>> {
    return this.request<Record<number, { liked: boolean; scraped: boolean; likeCount: number; scrapCount: number }>>('/api/reactions/status', {
      method: 'POST',
      body: JSON.stringify({ postIds }),
    });
  }

  // 댓글 좋아요 API
  async toggleCommentLike(commentId: number): Promise<{ liked: boolean; likeCount: number }> {
    // Next.js API 라우트를 통해 호출
    const response = await fetch(`/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // HttpOnly 쿠키 자동 전송
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 백엔드 응답을 프론트엔드 기대 형식으로 변환
    return {
      liked: data.isLiked || false,
      likeCount: data.likeCount || 0
    };
  }

  // 알림 관련 API
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.request<{ notifications: Notification[]; unreadCount: number }>('/api/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request<void>(`/api/notifications/${notificationId}`, {
      method: 'PUT',
      body: JSON.stringify({ isRead: true }),
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request<void>('/api/notifications/read-all', {
      method: 'POST',
    });
  }

  // 상점 관련 API
  async getStores(): Promise<Store[]> {
    return this.request<Store[]>('/api/admin/stores/list');
  }

  // 사용자 관련 API
  async getUserInfo(): Promise<User> {
    return this.request<User>('/api/user/info');
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 리뷰 관련 API
  async createReview(productId: string | number, data: { rating: number; content: string; images: string[] }): Promise<any> {
    const id = typeof productId === 'string' ? parseInt(productId) : productId;
    return this.request<any>(`/api/products/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReviews(productId: string | number, page: number = 0, size: number = 10): Promise<any> {
    const id = typeof productId === 'string' ? parseInt(productId) : productId;
    const params = new URLSearchParams({ 
      page: page.toString(), 
      size: size.toString() 
    });
    return this.request<any>(`/api/products/${id}/reviews?${params.toString()}`);
  }

  async toggleReviewHelpful(productId: string | number, reviewId: number): Promise<any> {
    const id = typeof productId === 'string' ? parseInt(productId) : productId;
    return this.request<any>(`/api/products/${id}/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  async updateReview(productId: string | number, reviewId: number, data: { rating: number; content: string; images: string[] }): Promise<any> {
    const id = typeof productId === 'string' ? parseInt(productId) : productId;
    return this.request<any>(`/api/products/${id}/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReview(productId: string | number, reviewId: number): Promise<void> {
    const id = typeof productId === 'string' ? parseInt(productId) : productId;
    console.log('리뷰 삭제 요청:', { productId: id, reviewId });
    return this.request<void>(`/api/products/${id}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // 문의 관련 API
  async createInquiry(productId: number, data: { title: string; content: string; isPrivate: boolean }): Promise<any> {
    return this.request<any>(`/api/products/${productId}/inquiries`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInquiries(productId: number, page: number = 0, size: number = 10): Promise<any> {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      size: size.toString() 
    });
    return this.request<any>(`/api/products/${productId}/inquiries?${params.toString()}`);
  }

  async answerInquiry(productId: number, inquiryId: number, answer: string): Promise<any> {
    return this.request<any>(`/api/products/${productId}/inquiries/${inquiryId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  async deleteInquiry(productId: number, inquiryId: number): Promise<void> {
    return this.request<void>(`/api/products/${productId}/inquiries/${inquiryId}`, {
      method: 'DELETE',
    });
  }

  // 사용자별 공개 코디 조회
  async getUserOutfits(userId: string, page: number = 0, size: number = 10): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    return this.request<any>(`/api/outfits/user/${userId}?${params.toString()}`);
  }

  // 사이즈 관련 API
  async getProductSizes(productId: number, inStockOnly: boolean = false): Promise<SizeVariant[]> {
    const params = new URLSearchParams();
    if (inStockOnly) {
      params.append('inStockOnly', 'true');
    }
    return this.request<SizeVariant[]>(`/api/products/${productId}/sizes?${params.toString()}`);
  }

  async getSizeVariant(productId: number, sizeVariantId: number): Promise<SizeVariant> {
    return this.request<SizeVariant>(`/api/products/${productId}/sizes/${sizeVariantId}`);
  }

  async getSizeVariantBySku(sku: string): Promise<SizeVariant> {
    return this.request<SizeVariant>(`/api/products/sizes/sku/${sku}`);
  }

  async getLowStockSizes(productId: number): Promise<SizeVariant[]> {
    return this.request<SizeVariant[]>(`/api/products/${productId}/sizes/low-stock`);
  }
}

export const apiClient = new ApiClient();
