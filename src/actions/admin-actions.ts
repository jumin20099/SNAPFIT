"use server"

interface Product {
  product_content: string
  id?: number
  product_name: string
  product_image: string
  product_link: string
  product_category: string
  partner_mall: string
  price: string
  created_at?: string
  status?: "active" | "inactive"
}

interface PartnerMall {
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
  total_sales: number
  conversion_rate: number
}

interface PartnerAnalytics {
  partner_id: number
  partner_name: string
  total_sales: number
  commission_owed: number
  commission_paid: number
  payment_status: "paid" | "pending" | "overdue"
  payment_due_date: string
  is_active: boolean
}

interface PartnershipApplication {
  id: number
  company_name: string
  contact_email: string
  contact_phone: string
  business_registration: string
  application_date: string
  status: "pending" | "approved" | "rejected"
  documents: string[]
}

interface ProductApproval {
  id: number
  product_name: string
  partner_name: string
  images: string[]
  description: string
  price: string
  category: string
  status: "pending" | "approved" | "rejected"
  submitted_date: string
}

// 상품 관련 액션들
export async function getProducts() {
  if (typeof window === "undefined") {
    return [];
  }
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/products/list", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("상품 목록을 불러오지 못했습니다.");
  return res.json();
}

export async function addProduct(productData: any) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/products/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("상품 등록 실패");
  return res.json();
}

export async function deleteProduct(productId: number) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("상품 삭제 실패");
  return res.json();
}

export async function updateProduct(productId: number, formData: FormData) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error("상품 수정 실패");
  return res.json();
}

// 상품 통계
export async function getProductAnalytics() {
  if (typeof window === "undefined") {
    return [];
  }
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/products/analytics", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("상품 통계 불러오기 실패");
  return res.json();
}

export async function getPartnerMalls() {
  if (typeof window === "undefined") {
    return [];
  }
  console.log("fetching partner malls");
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/stores/list", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("제휴몰 목록을 불러오지 못했습니다.");
  return res.json();
}

// export async function deletePartnerMall(id: number) {
//   const token = localStorage.getItem("token");
//   const res = await fetch(`/api/admin/stores/${id}`, {
//     method: "DELETE",
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (res.ok) return { success: true, message: "삭제 성공" };
//   return { success: false, message: "삭제 실패" };
// }

// 제휴사 통계
export async function getPartnerAnalytics() {
  if (typeof window === "undefined") {
    return [];
  }
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/stores/analytics", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("제휴사 통계 불러오기 실패");
  return res.json();
}

export async function togglePartnerStatus(partnerId: number, isActive: boolean) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/stores/${partnerId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("제휴사 상태 변경 실패");
  return res.json();
}

export async function markCommissionPaid(partnerId: number) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/stores/${partnerId}/commission/paid`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("커미션 지급 처리 실패");
  return res.json();
}

export async function getPartnershipApplications() {
  if (typeof window === "undefined") {
    return [];
  }
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/partnership/applications", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("제휴 신청 목록 불러오기 실패");
  return res.json();
}

export async function approvePartnershipApplication(applicationId: number, approved: boolean) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/partnership/applications/${applicationId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ approved }),
  });
  if (!res.ok) throw new Error("제휴 신청 승인/거절 실패");
  return res.json();
}

export async function getProductApprovals() {
  if (typeof window === "undefined") {
    return [];
  }
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/products/approvals", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("상품 승인 목록 불러오기 실패");
  return res.json();
}

export async function approveProduct(productId: number, approved: boolean) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/products/${productId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ approved }),
  });
  if (!res.ok) throw new Error("상품 승인/거절 실패");
  return res.json();
}

export async function toggleProductStatus(productId: number, isActive: boolean) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/products/${productId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("상품 상태 변경 실패");
  return res.json();
}
