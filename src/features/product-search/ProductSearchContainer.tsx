'use client';

import { useState } from 'react';
import { useCategoryProducts } from '@/shared/api/queries';
import { ProductSearchPanel } from './ProductSearchPanel';
import { Product } from '@/shared/types';

interface ProductSearchContainerProps {
  onProductSelect?: (product: Product) => void;
  className?: string;
}

export function ProductSearchContainer({ 
  onProductSelect, 
  className 
}: ProductSearchContainerProps) {
  const [selectedMajor, setSelectedMajor] = useState<string>('');
  const [selectedSub, setSelectedSub] = useState<string>('');

  // TanStack Query를 사용한 데이터 페칭
  const { 
    data: products = [], 
    isLoading, 
    error 
  } = useCategoryProducts(selectedMajor, selectedSub);

  const handleCategorySelect = (major: string, sub?: string) => {
    setSelectedMajor(major);
    setSelectedSub(sub || '');
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product);
  };

  return (
    <ProductSearchPanel
      products={products}
      loading={isLoading}
      error={error}
      selectedMajor={selectedMajor}
      selectedSub={selectedSub}
      onCategorySelect={handleCategorySelect}
      onProductSelect={handleProductSelect}
      className={className}
    />
  );
}
