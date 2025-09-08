'use client';

import { useState, useEffect } from 'react';
import { useCody } from '@/hooks/useCody';
import { useCategoryProducts } from '@/shared/api/queries';
import { CodyBuilderPanel } from './CodyBuilderPanel';
import { CodyItem, getCodySlotFromCategory } from '@/entities/cody/model';

interface CodyBuilderContainerProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string | null;
}

export function CodyBuilderContainer({ 
  isOpen, 
  onClose, 
  initialProductId 
}: CodyBuilderContainerProps) {
  const { items: codyItems, setItem, removeItem } = useCody();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  // 카테고리별 상품 데이터 페칭
  const { 
    data: availableProducts = [], 
    isLoading 
  } = useCategoryProducts(selectedCategory, selectedSubCategory);

  // 초기 상품 ID가 있을 때 처리
  useEffect(() => {
    if (initialProductId && availableProducts.length > 0) {
      const product = availableProducts.find(p => p.productIdx?.toString() === initialProductId);
      if (product) {
        const slot = getCodySlotFromCategory(product.majorCategory || '기타', product.productName || '');
        const codyItem: CodyItem = {
          id: product.productIdx || 0,
          name: product.productName || '상품',
          image: product.productImage || '/placeholder.svg',
          category: product.majorCategory || '기타',
          slot: slot,
          price: product.productPrice,
          brand: product.storeMall,
        };
        setItem(codyItem);
      }
    }
  }, [initialProductId, availableProducts, setItem]);

  const handleCategoryChange = (major: string, sub?: string) => {
    setSelectedCategory(major);
    setSelectedSubCategory(sub || '');
  };

  const handleItemSelect = (product: any) => {
    const slot = getCodySlotFromCategory(product.majorCategory || '기타', product.productName || '');
    const codyItem: CodyItem = {
      id: product.productIdx,
      name: product.productName,
      image: product.productImage,
      category: product.majorCategory,
      slot: slot,
      price: product.productPrice,
      brand: product.storeMall,
    };
    setItem(codyItem);
  };

  const handleItemRemove = (slot: string) => {
    removeItem(slot as any);
  };

  const handleSave = () => {
    // 코디 저장 로직
    console.log('코디 저장:', codyItems);
    alert('코디가 저장되었습니다!');
  };

  if (!isOpen) return null;

  return (
    <CodyBuilderPanel
      codyItems={codyItems}
      availableProducts={availableProducts}
      loading={isLoading}
      selectedCategory={selectedCategory}
      selectedSubCategory={selectedSubCategory}
      onCategoryChange={handleCategoryChange}
      onItemSelect={handleItemSelect}
      onItemRemove={handleItemRemove}
      onSave={handleSave}
      onClose={onClose}
    />
  );
}
