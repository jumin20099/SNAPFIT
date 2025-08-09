"use client"
import { useViewCount } from '@/hooks/useViewCount';

interface Props {
  productId: number;
}

export default function ViewCountDisplay({ productId }: Props) {
  const key = `product:${productId}:views`;
  const count = useViewCount(key);
  if (count === 0) return null;
  return <p className="text-sm text-gray-600">현재 {count}명이 해당 상품을 보고 있어요</p>;
} 