// 클라이언트 전용 fetch 함수 모음
// HttpOnly 쿠키 기반 인증을 사용합니다.

import { authenticatedFetch } from '@/lib/auth-client';

export async function getStoreMalls() {
  if (typeof window === "undefined") {
    return [];
  }
  
  const res = await authenticatedFetch("/api/admin/stores/list");
  if (!res.ok) throw new Error("제휴몰 목록을 불러오지 못했습니다.");
  return res.json();
}

export async function getProducts() {
  if (typeof window === "undefined") {
    return [];
  }
  const res = await authenticatedFetch("/api/admin/products/list");
  if (!res.ok) throw new Error("상품 목록을 불러오지 못했습니다.");
  return res.json();
}

export async function deleteProduct(productId: number) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const res = await authenticatedFetch(`/api/admin/products/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("상품 삭제 실패");
  // 본문이 있으면 json 파싱, 없으면 undefined 반환
  const text = await res.text();
  if (!text) return;
  try {
    return JSON.parse(text);
  } catch {
    return;
  }
}

export async function toggleProductStatus(productId: number, isActive: boolean) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const res = await authenticatedFetch(`/api/admin/products/${productId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("상품 상태 변경 실패");
  return res.json();
}

export async function checkStoreDependencies(storeId: number) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const res = await authenticatedFetch(`/api/admin/stores/${storeId}/dependencies`);
  
  if (!res.ok) {
    throw new Error("의존성 확인 실패");
  }
  
  return res.json();
}

export async function deleteStoreMall(mallId: number) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const res = await authenticatedFetch(`/api/admin/stores/${mallId}`, {
    method: "DELETE",
  });
  
  if (!res.ok) {
    // 에러 응답의 본문을 읽어서 더 자세한 에러 정보 제공
    let errorMessage = "제휴몰 삭제 실패";
    try {
      const errorBody = await res.text();
      if (errorBody) {
        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorBody || errorMessage;
        }
      }
    } catch {
      // 에러 본문을 읽을 수 없는 경우 기본 메시지 사용
    }
    
    throw new Error(`${errorMessage} (HTTP ${res.status})`);
  }
  
  const text = await res.text();
  if (!text) return;
  try {
    return JSON.parse(text);
  } catch {
    return;
  }
}

export async function toggleStoreStatus(storeId: number, isActive: boolean) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const res = await authenticatedFetch(`/api/admin/stores/${storeId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("제휴몰 상태 변경 실패");
  return res.json();
}

// 제휴사 상품도 동일 엔드포인트로 통합했으므로 별도 함수 제거
// 필요시 addProduct, deleteProduct 등도 이 파일로 옮길 수 있음
