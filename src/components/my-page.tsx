"use client"

import { useState } from "react"
import { ChevronDown, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import LikedBrandsPage from "./liked-brands-page"
import LikedProductsPage from "./liked-products-page"
import ScrapPage from "./scrap-page"
import MyCodyPage from "./my-cody-page"

interface Brand {
  id: number
  name: string
  logo: string
  liked: boolean
}

interface Product {
  id: number
  name: string
  description: string
  image: string
  liked: boolean
}

const mockBrands: Brand[] = [
  {
    id: 1,
    name: "나이키",
    logo: "/placeholder.svg?height=40&width=40",
    liked: true,
  },
  {
    id: 2,
    name: "아디다스",
    logo: "/placeholder.svg?height=40&width=40",
    liked: true,
  },
  {
    id: 3,
    name: "유니클로",
    logo: "/placeholder.svg?height=40&width=40",
    liked: true,
  },
]

const mockLikedProducts: Product[] = [
  {
    id: 1,
    name: "화이트 티셔츠",
    description: "편안한 면 소재의 기본 티셔츠",
    image: "/placeholder.svg?height=60&width=60",
    liked: true,
  },
  {
    id: 2,
    name: "블루 청바지",
    description: "슬림핏 스트레치 데님",
    image: "/placeholder.svg?height=60&width=60",
    liked: true,
  },
  {
    id: 3,
    name: "화이트 스니커즈",
    description: "클래식 화이트 운동화",
    image: "/placeholder.svg?height=60&width=60",
    liked: true,
  },
]

interface MyPageProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MyPage({ open, onOpenChange }: MyPageProps) {
  const [brands, setBrands] = useState(mockBrands)
  const [likedProducts, setLikedProducts] = useState(mockLikedProducts)
  const [isLikesOpen, setIsLikesOpen] = useState(false)
  const [isScrapOpen, setIsScrapOpen] = useState(false)
  const [isCodyOpen, setIsCodyOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<"main" | "liked-brands" | "liked-products" | "scrap" | "my-cody">(
    "main",
  )

  const toggleBrandLike = (brandId: number) => {
    setBrands(brands.map((brand) => (brand.id === brandId ? { ...brand, liked: !brand.liked } : brand)))
  }

  const toggleProductLike = (productId: number) => {
    setLikedProducts(
      likedProducts.map((product) => (product.id === productId ? { ...product, liked: !product.liked } : product)),
    )
  }

  if (!open) return null

  // Handle different pages
  if (currentPage === "liked-brands") {
    return <LikedBrandsPage onBack={() => setCurrentPage("main")} />
  }

  if (currentPage === "liked-products") {
    return <LikedProductsPage onBack={() => setCurrentPage("main")} />
  }

  if (currentPage === "scrap") {
    return <ScrapPage onBack={() => setCurrentPage("main")} />
  }

  if (currentPage === "my-cody") {
    return <MyCodyPage onBack={() => setCurrentPage("main")} />
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">마이페이지</h1>
        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h2 className="font-medium">사용자님</h2>
            <p className="text-sm text-gray-600">프로필을 설정해보세요</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-2">
        {/* 좋아요 */}
        <Collapsible open={isLikesOpen} onOpenChange={setIsLikesOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-12">
              <span className="font-medium">좋아요</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isLikesOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pl-4">
            <Button
              variant="ghost"
              className="w-full justify-start h-10"
              onClick={() => setCurrentPage("liked-brands")}
            >
              브랜드
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-10"
              onClick={() => setCurrentPage("liked-products")}
            >
              상품
            </Button>
          </CollapsibleContent>
        </Collapsible>

        {/* 스크랩 */}
        <Collapsible open={isScrapOpen} onOpenChange={setIsScrapOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-12">
              <span className="font-medium">스크랩</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isScrapOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pl-4">
            <Button variant="ghost" className="w-full justify-start h-10" onClick={() => setCurrentPage("scrap")}>
              스크랩 보기
            </Button>
          </CollapsibleContent>
        </Collapsible>

        {/* 내 코디 */}
        <Collapsible open={isCodyOpen} onOpenChange={setIsCodyOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-12">
              <span className="font-medium">내 코디</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isCodyOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pl-4">
            <Button variant="ghost" className="w-full justify-start h-10" onClick={() => setCurrentPage("my-cody")}>
              내 코디 보기
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
