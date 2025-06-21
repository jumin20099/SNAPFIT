"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import MyPage from "@/components/my-page"
import CommunityPage from "@/components/community-page"
import SocialLoginPage from "@/components/social-login"
import CodyDisplay from "@/components/CodyDisplay"
import ProductPanel from "@/components/ProductPanel"
import TopNavigation from "@/components/TopNavigation"
import { getCodyPosition } from "@/utils/codyUtils"

interface Product {
  id: number
  name: string
  price: string
  category: string
  image: string
  liked: boolean
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "화이트 티셔츠",
    price: "29,000원",
    category: "상의",
    image: "/placeholder.svg?height=200&width=200",
    liked: false,
  },
  {
    id: 2,
    name: "블루 청바지",
    price: "89,000원",
    category: "하의",
    image: "/placeholder.svg?height=200&width=200",
    liked: true,
  },
  {
    id: 3,
    name: "블랙 자켓",
    price: "159,000원",
    category: "아우터",
    image: "/placeholder.svg?height=200&width=200",
    liked: false,
  },
  {
    id: 4,
    name: "화이트 스니커즈",
    price: "129,000원",
    category: "신발",
    image: "/placeholder.svg?height=200&width=200",
    liked: true,
  },
  {
    id: 5,
    name: "크로스백",
    price: "79,000원",
    category: "가방",
    image: "/placeholder.svg?height=200&width=200",
    liked: false,
  },
  {
    id: 6,
    name: "그레이 후드",
    price: "69,000원",
    category: "상의",
    image: "/placeholder.svg?height=200&width=200",
    liked: true,
  },
  {
    id: 7,
    name: "블랙 캡",
    price: "35,000원",
    category: "패션소품",
    image: "/placeholder.svg?height=200&width=200",
    liked: false,
  },
  {
    id: 8,
    name: "레더 부츠",
    price: "189,000원",
    category: "신발",
    image: "/placeholder.svg?height=200&width=200",
    liked: false,
  },
  {
    id: 9,
    name: "울 코트",
    price: "229,000원",
    category: "아우터",
    image: "/placeholder.svg?height=200&width=200",
    liked: true,
  },
  {
    id: 10,
    name: "실버 반지",
    price: "59,000원",
    category: "패션소품",
    image: "/placeholder.svg?height=200&width=200",
    liked: false,
  },
  {
    id: 11,
    name: "가죽 팔찌",
    price: "49,000원",
    category: "패션소품",
    image: "/placeholder.svg?height=200&width=200",
    liked: true,
  },
]

export default function SnapFitMobile() {
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false)
  const [products, setProducts] = useState(mockProducts)
  const [isMyPageOpen, setIsMyPageOpen] = useState(false)
  const [isSocialLoginOpen, setIsSocialLoginOpen] = useState(false)
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)
  const [codyItems, setCodyItems] = useState<{ [key: string]: Product }>({})

  const addToCody = (product: Product) => {
    const position = getCodyPosition(product.category, product.name)
    setCodyItems((prev) => ({
      ...prev,
      [position]: product,
    }))
  }

  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // 로컬 스토리지에 JWT 토큰이 있으면 로그인된 상태로 간주
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const removeCodyItem = (position: string) => {
    setCodyItems((prev) => {
      const newItems = { ...prev }
      delete newItems[position]
      return newItems
    })
  }

  const toggleLike = (productId: number) => {
    setProducts(products.map((product) => (product.id === productId ? { ...product, liked: !product.liked } : product)))
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Main Cody Display - 카테고리 창이 열렸을 때는 숨김 */}
      {!isProductPanelOpen && <CodyDisplay codyItems={codyItems} removeCodyItem={removeCodyItem} />}

      {/* Top Navigation */}
      <TopNavigation
        onMyPageClick={() => setIsMyPageOpen(true)}
        onCommunityClick={() => setIsCommunityOpen(true)}
        onCategoryClick={() => setIsProductPanelOpen(true)}
      />

      {/* Login Button (temporary for testing) */}
      {!isLoggedIn && (
      <div className="absolute bottom-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSocialLoginOpen(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          로그인
        </Button>
      </div>
      )}

      {/* Product Panel */}
      <ProductPanel
        isOpen={isProductPanelOpen}
        onOpenChange={setIsProductPanelOpen}
        codyItems={codyItems}
        removeCodyItem={removeCodyItem}
        products={products}
        onToggleLike={toggleLike}
        onAddToCody={addToCody}
      />

      {/* My Page */}
      <MyPage open={isMyPageOpen} onOpenChange={setIsMyPageOpen} />

      {/* Social Login Page */}
      <SocialLoginPage 
        open={isSocialLoginOpen} 
        onOpenChange={setIsSocialLoginOpen} 
        onSwitchToSignup={() => {}} // 임시 함수
      />

      {/* Community Page */}
      {isCommunityOpen && <CommunityPage />}
    </div>
  )
}
