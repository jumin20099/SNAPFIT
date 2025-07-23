"use client";

import { useCart } from '@/contexts/CartContext';
import { ArrowLeft, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartPage({ onBack }: { onBack: () => void }) {
  const { items, removeItem, clear } = useCart();
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">장바구니</h1>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={clear} className="p-2 text-red-500">
            <Trash className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border p-3 rounded">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">₩{item.price.toLocaleString()} x {item.quantity}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <p className="font-bold mb-2">총 금액: ₩{total.toLocaleString()}</p>
        <Button className="w-full" disabled>
          결제 기능 준비 중
        </Button>
      </div>
    </div>
  );
} 