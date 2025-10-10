"use server"

import { cookies } from 'next/headers'

interface Product {
  product_content: string
  id?: number
  product_name: string
  product_image: string
  product_link: string
  product_category: string
  store_mall: string
  price: string
  created_at?: string
  status?: "active" | "inactive"
}

interface StoreMall {
  id?: number
  mall_name: string
  mall_url: string
  commission_rate: number
  status: "active" | "inactive"
  created_at?: string
}

// 새로운 인터페이스들 추가
interface ProductAnalytics {
  product_id: number
  product_name: string
  view_count: number
  purchase_count: number
  revenue: number
  commission: number
}

interface StoreMallAnalytics {
  store_id: number
  store_name: string
  total_sales: number
  commission_earned: number
  pending_commission: number
}

interface StoreApplication {
  id: number
  store_name: string
  store_url: string
  applicant_name: string
  applicant_email: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface ProductApproval {
  id: number
  product_name: string
  store_name: string
  price: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
}

/**
 * 서버 사이드에서 인증된 fetch 요청을 수행합니다.
 * HttpOnly 쿠키를 자동으로 전송합니다.
 */
async function authenticatedServerFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const cookieStore = cookies()
  const token = cookieStore.get('access_token')?.value
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Cookie': `access_token=${token}` }),
      ...options.headers,
    },
  })
}

export async function getProducts(): Promise<Product[]> {
  const res = await authenticatedServerFetch("/api/admin/products/list");
  if (!res.ok) return [];
  return res.json();
}

export async function addProduct(product: Product) {
  const res = await authenticatedServerFetch("/api/admin/products/add", {
    method: "POST",
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("상품 추가 실패");
  return res.json();
}

export async function deleteProduct(productId: number) {
  const res = await authenticatedServerFetch(`/api/admin/products/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("상품 삭제 실패");
  return res.json();
}

export async function updateProduct(productId: number, product: Product) {
  const res = await authenticatedServerFetch(`/api/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("상품 수정 실패");
  return res.json();
}

export async function getProductAnalytics(): Promise<ProductAnalytics[]> {
  const res = await authenticatedServerFetch("/api/admin/products/analytics");
  if (!res.ok) return [];
  return res.json();
}

export async function getStoreMalls(): Promise<StoreMall[]> {
  const res = await authenticatedServerFetch("/api/admin/stores/list");
  if (!res.ok) return [];
  return res.json();
}

export async function getStoreMallAnalytics(): Promise<StoreMallAnalytics[]> {
  const res = await authenticatedServerFetch("/api/admin/stores/analytics");
  if (!res.ok) return [];
  return res.json();
}

export async function updateStoreMallStatus(storeId: number, status: "active" | "inactive") {
  const res = await authenticatedServerFetch(`/api/admin/stores/${storeId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("스토어 상태 변경 실패");
  return res.json();
}

export async function markCommissionPaid(storeId: number) {
  const res = await authenticatedServerFetch(`/api/admin/stores/${storeId}/commission/paid`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("커미션 지급 처리 실패");
  return res.json();
}

export async function getStoreApplications(): Promise<StoreApplication[]> {
  const res = await authenticatedServerFetch("/api/admin/store/applications");
  if (!res.ok) return [];
  return res.json();
}

export async function approveStoreApplication(applicationId: number) {
  const res = await authenticatedServerFetch(`/api/admin/store/applications/${applicationId}/approve`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("스토어 승인 실패");
  return res.json();
}

export async function getProductApprovals(): Promise<ProductApproval[]> {
  const res = await authenticatedServerFetch("/api/admin/products/approvals");
  if (!res.ok) return [];
  return res.json();
}

export async function approveProduct(productId: number) {
  const res = await authenticatedServerFetch(`/api/admin/products/${productId}/approve`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("상품 승인 실패");
  return res.json();
}

export async function updateProductStatus(productId: number, status: "active" | "inactive") {
  const res = await authenticatedServerFetch(`/api/admin/products/${productId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("상품 상태 변경 실패");
  return res.json();
}

export async function getPartnerProducts(): Promise<Product[]> {
  const res = await authenticatedServerFetch("/api/partner/products");
  if (!res.ok) return [];
  return res.json();
}
