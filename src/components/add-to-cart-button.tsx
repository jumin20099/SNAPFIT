"use client"
import { useCart } from '@/contexts/CartContext';

interface Props {
  product: {
    productIdx: number;
    productName: string;
    productPrice: number;
    productImage: string;
  };
}

export default function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() =>
        addItem({
          id: product.productIdx,
          name: product.productName,
          price: product.productPrice,
          image: product.productImage,
        })
      }
      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
      data-testid="add-to-cart"
    >
      장바구니 담기
    </button>
  );
} 