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

const mockLikedProducts: Product[] = [
  {
    id: 1,
    name: "화이트 티셔츠",
    description: "편안한 면 소재의 기본 티셔츠",
    price: "29,000원",
    image: "/placeholder.svg?height=80&width=80",
    liked: true,
  },
  {
    id: 2,
    name: "블루 청바지",
    description: "슬림핏 스트레치 데님",
    price: "89,000원",
    image: "/placeholder.svg?height=80&width=80",
    liked: true,
  },
  {
    id: 3,
    name: "화이트 스니커즈",
    description: "클래식 화이트 운동화",
    price: "129,000원",
    image: "/placeholder.svg?height=80&width=80",
    liked: true,
  },
  {
    id: 4,
    name: "블랙 자켓",
    description: "캐주얼 블레이저 자켓",
    price: "159,000원",
    image: "/placeholder.svg?height=80&width=80",
    liked: true,
  },
  {
    id: 5,
    name: "크로스백",
    description: "가죽 크로스백",
    price: "79,000원",
    image: "/placeholder.svg?height=80&width=80",
    liked: true,
  },
]

interface LikedProductsPageProps {
  onBack: () => void
}

export default function LikedProductsPage({ onBack }: LikedProductsPageProps) {
  const [products, setProducts] = useState(mockLikedProducts)

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
