import { useEffect, useState } from 'react';

export interface Product {
  productIdx: number;
  productName: string;
  productImage: string;
  productPrice: number;
}

// 카테고리별 상품 리스트를 가져오는 훅
export function useCategoryProducts(major: string, sub?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!major) return;
    setLoading(true);
    const params = new URLSearchParams({ major });
    if (sub) params.append('sub', sub);
    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, [major, sub]);

  return { products, loading };
} 