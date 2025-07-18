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
// 필요시 addProduct, deleteProduct 등도 이 파일로 옮길 수 있음 