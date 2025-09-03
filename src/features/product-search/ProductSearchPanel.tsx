'use client';

import { Product } from '@/shared/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { cn } from '@/lib/utils';

interface ProductSearchPanelProps {
  products: Product[];
  loading: boolean;
  error: Error | null;
  selectedMajor: string;
  selectedSub: string;
  onCategorySelect: (major: string, sub?: string) => void;
  onProductSelect: (product: Product) => void;
  className?: string;
}

export function ProductSearchPanel({
  products,
  loading,
  error,
  selectedMajor,
  selectedSub,
  onCategorySelect,
  onProductSelect,
  className,
}: ProductSearchPanelProps) {
  if (error) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <p className="text-red-500">상품을 불러오는 중 오류가 발생했습니다.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('p-4', className)}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <p className="text-gray-500">상품이 없습니다.</p>
        {selectedMajor && (
          <p className="text-sm text-gray-400 mt-1">
            {selectedMajor} {selectedSub && `> ${selectedSub}`} 카테고리에 상품이 없습니다.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('p-4', className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.productIdx}
            product={{
              id: product.productIdx?.toString() || '0',
              name: product.productName || '상품',
              price: product.productPrice || 0,
              imageUrl: product.productImage || '/placeholder.svg',
              brand: product.storeName || '',
              badges: product.tags || [],
            }}
          />
        ))}
      </div>
    </div>
  );
}
