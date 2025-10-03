/**
 * API 클라이언트
 * Axios 인터셉터를 사용하여 토큰 자동 갱신을 처리합니다.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import TokenManager from './token-manager';

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;

  private constructor() {
    this.tokenManager = TokenManager.getInstance();
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
      timeout: 10000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Axios 인터셉터 설정
   */
  private setupInterceptors(): void {
    // 요청 인터셉터: Access Token을 헤더에 추가
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const accessToken = this.tokenManager.getAccessToken();
        
        if (accessToken && this.tokenManager.isAccessTokenValid()) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터: 401 응답 시 토큰 갱신 후 재시도
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // 401 Unauthorized 응답이고, 아직 재시도하지 않은 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Refresh Token으로 Access Token 갱신
            const newAccessToken = await this.tokenManager.refreshAccessToken();
            
            // 새로운 Access Token으로 원래 요청 재시도
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            } else {
              originalRequest.headers = {
                Authorization: `Bearer ${newAccessToken}`,
              };
            }

            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // 토큰 갱신 실패 시 로그아웃 처리
            this.tokenManager.clearTokens();
            console.error('토큰 갱신 실패:', refreshError);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET 요청
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST 요청
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT 요청
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE 요청
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * PATCH 요청
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * 원시 Axios 인스턴스 반환 (고급 사용)
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default ApiClient;
