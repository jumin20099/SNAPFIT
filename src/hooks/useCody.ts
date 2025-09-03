import { useState } from "react";
import { CodySlot, CodyItem, CodyState, CodyActions, getCodySlotFromCategory } from "@/entities/cody/model";

export const useCody = (): CodyState & CodyActions => {
  const [codyItems, setCodyItems] = useState<Partial<Record<CodySlot, CodyItem>>>({});

  const setItem = (item: CodyItem) => {
    setCodyItems((prev) => ({
      ...prev,
      [item.slot]: item,
    }));
  };

  const removeItem = (slot: CodySlot) => {
    setCodyItems((prev) => {
      const newItems = { ...prev };
      delete newItems[slot];
      return newItems;
    });
  };

  const clearAll = () => {
    setCodyItems({});
  };

  const getItem = (slot: CodySlot): CodyItem | undefined => {
    return codyItems[slot];
  };

  const hasItem = (slot: CodySlot): boolean => {
    return !!codyItems[slot];
  };

  // 기존 API와의 호환성을 위한 deprecated 함수들
  const addToCody = (product: any) => {
    const slot = getCodySlotFromCategory(product.category, product.name);
    const codyItem: CodyItem = {
      id: product.id || product.productIdx,
      name: product.name || product.productName,
      image: product.image || product.productImage,
      category: product.category,
      slot,
      price: product.price || product.productPrice,
      brand: product.brand,
    };
    setItem(codyItem);
  };

  const removeCodyItem = (position: string) => {
    removeItem(position as CodySlot);
  };

  return {
    items: codyItems,
    setItem,
    removeItem,
    clearAll,
    getItem,
    hasItem,
  };
}; 