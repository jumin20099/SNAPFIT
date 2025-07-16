"use client"

import { useState } from "react"
import { ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Product {
  id: number
  name: string
  description: string
  price: string
  image: string
  liked: boolean
}

interface LikedProductsPageProps {
  onBack: () => void
}

export default function LikedProductsPage({ onBack }: LikedProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([])

  const toggleProductLike = (productId: number) => {
    setProducts(products.map((product) => (product.id === productId ? { ...product, liked: !product.liked } : product)))
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">상품</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {products
            .filter((product) => product.liked)
            .map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* 상품 사진 */}
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-16 h-16 rounded object-cover"
                    />

                    {/* 상품 설명 */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                      <p className="text-sm font-medium text-blue-600">{product.price}</p>
                    </div>

                    {/* 좋아요 버튼 */}
                    <Button variant="ghost" size="sm" onClick={() => toggleProductLike(product.id)} className="p-2">
                      <Heart className={`w-6 h-6 ${product.liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
