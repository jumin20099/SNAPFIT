// 클라이언트 전용 fetch 함수 모음

export async function getStoreMalls() {
  if (typeof window === "undefined") {
    return [];
  }
  console.log("fetching store malls");
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/stores/list", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("제휴몰 목록을 불러오지 못했습니다.");
  return res.json();
}

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

export async function deleteStoreMall(mallId: number) {
  if (typeof window === "undefined") {
    throw new Error("클라이언트 환경에서만 사용 가능합니다.");
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/stores/${mallId}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("제휴몰 삭제 실패");
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
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/stores/${storeId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("제휴몰 상태 변경 실패");
  return res.json();
}

// 제휴사 상품도 동일 엔드포인트로 통합했으므로 별도 함수 제거
// 필요시 addProduct, deleteProduct 등도 이 파일로 옮길 수 있음 