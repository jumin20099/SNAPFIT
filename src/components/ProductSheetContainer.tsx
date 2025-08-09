"use client"

import { Search, Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CodyDisplayContainer } from "./CodyDisplayContainer"
import { useCody } from "@/hooks/useCody"
import { useState } from "react";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import ProductCard from "./product-card"

interface ProductSheetContainerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ProductSheetContainer = ({ open, onOpenChange }: ProductSheetContainerProps) => {
  // 카테고리 상수 선언
  const categories = ["상의", "하의", "아우터", "신발", "가방", "패션소품"];
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const { products, loading } = useCategoryProducts(selectedCategory);

  const { addToCody } = useCody()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-screen rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          <div className="absolute top-2 right-2 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-[30%] border-b">
            <CodyDisplayContainer isCompact={true} />
          </div>

          <div className="h-[70%] flex flex-col">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-2">
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((category: string) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm">
                  전체보기
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.productIdx}
                    product={{
                      productIdx: product.productIdx,
                      productName: product.productName,
                      productContent: '',
                      productPrice: product.productPrice,
                      productImage: product.productImage,
                      majorCategory: selectedCategory,
                      subCategory: '',
                      liked: false
                    }}
                    onViewDetail={() => {}} // ProductSheetContainer에서는 상세보기 기능 없음
                    onAddToCody={addToCody}
                    onToggleLike={() => {}} // ProductSheetContainer에서는 좋아요 기능 없음
                    compact={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 