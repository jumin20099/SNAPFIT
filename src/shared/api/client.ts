import { Product, Post, User, Store, Notification, ApiResponse, PaginatedResponse } from './types';

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
      credentials: 'include',
      ...options,
    };

    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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
    
    console.log('API 호출:', { major, sub, url, queryString });
    
    const result = await this.request<Product[]>(url);
    console.log('API 응답:', { url, resultLength: result?.length, result });
    
    return result;
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
  async toggleLike(targetIdx: number, targetType: 'product' | 'brand' | 'outfit'): Promise<{ liked: boolean; count: number }> {
    const params = new URLSearchParams({ 
      targetIdx: targetIdx.toString(), 
      targetType 
    });
    
    return this.request<{ liked: boolean; count: number }>('/api/likes/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
  }

  // 스크랩 관련 API
  async toggleScrap(postId: number): Promise<{ isScrapped: boolean; scrapCount: number }> {
    return this.request<{ isScrapped: boolean; scrapCount: number }>(`/api/posts/${postId}/scrap`, {
      method: 'POST',
    });
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
}

export const apiClient = new ApiClient();
