'use client';

import { VirtualizedGrid } from '@/shared/ui/VirtualizedList';
import { ProductCard } from '@/components/ui/ProductCard';
import { Product } from '@/shared/types';
import { cn } from '@/lib/utils';

interface VirtualizedProductGridProps {
  products: Product[];
  containerHeight?: number;
  className?: string;
  onProductClick?: (product: Product) => void;
}

export function VirtualizedProductGrid({
  products,
  containerHeight = 600,
  className,
  onProductClick,
}: VirtualizedProductGridProps) {
  const itemWidth = 280; // 상품 카드 너비
  const itemHeight = 400; // 상품 카드 높이
  const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 32 : 1200; // 패딩 고려

  const renderProduct = (product: Product, index: number) => (
    <div
      key={product.productIdx || index}
      onClick={() => onProductClick?.(product)}
      className="cursor-pointer"
    >
      <ProductCard
        product={{
          id: (product.productIdx || index).toString(),
          name: product.productName || '상품',
          price: product.productPrice || 0,
          imageUrl: product.productImage || '/placeholder.svg',
          brand: product.storeName || '',
          badges: product.tags || [],
        }}
      />
    </div>
  );

  if (products.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <p className="text-gray-500">상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <VirtualizedGrid
      items={products}
      itemWidth={itemWidth}
      itemHeight={itemHeight}
      containerWidth={containerWidth}
      containerHeight={containerHeight}
      renderItem={renderProduct}
      className={className}
      overscan={3}
    />
  );
}
