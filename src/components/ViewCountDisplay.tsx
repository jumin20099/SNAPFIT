"use client"
import { useViewCount } from '@/hooks/useViewCount';

interface Props {
  productId: number;
  initialViewers?: number;
}

export default function ViewCountDisplay({ productId, initialViewers = 0 }: Props) {
  const key = `product:${productId}:live`;
  const count = useViewCount(key, initialViewers);
  if (count <= 3) return null;
  return <p className="text-sm text-gray-600">현재 {count}명이 이 상품을 보고 있어요!</p>;
} 