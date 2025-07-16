"use client"

import { useState } from "react"
import { ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Brand {
  id: number
  name: string
  logo: string
  liked: boolean
}

interface LikedBrandsPageProps {
  onBack: () => void
}

export default function LikedBrandsPage({ onBack }: LikedBrandsPageProps) {
  const [brands, setBrands] = useState<Brand[]>([])

  const toggleBrandLike = (brandId: number) => {
    setBrands(brands.map((brand) => (brand.id === brandId ? { ...brand, liked: !brand.liked } : brand)))
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">브랜드</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {brands
            .filter((brand) => brand.liked)
            .map((brand) => (
              <Card key={brand.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* 브랜드 로고 */}
                    <img
                      src={brand.logo || "/placeholder.svg"}
                      alt={brand.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    {/* 브랜드 이름 */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{brand.name}</h3>
                      <p className="text-sm text-gray-600">팔로워 1.2만명</p>
                    </div>

                    {/* 좋아요 버튼 */}
                    <Button variant="ghost" size="sm" onClick={() => toggleBrandLike(brand.id)} className="p-2">
                      <Heart className={`w-6 h-6 ${brand.liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
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
