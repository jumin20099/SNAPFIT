import { useEffect, useState } from 'react';

export interface Product {
  productIdx: number;
  productName: string;
  productImage: string;
  productPrice: number;
}

// 카테고리별 상품 리스트를 가져오는 훅
export function useCategoryProducts(category: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    fetch(`/api/products?category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, [category]);

  return { products, loading };
} 