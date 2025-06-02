"use client"

import { useState } from "react"
import { Search, Heart, Grid3X3, User, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import MyPage from "@/components/my-page"
import LoginPage from "@/components/login-page"
import SignupPage from "@/components/signup-page"
import CommunityPage from "@/components/community-page"

const categories = ["전체", "상의", "하의", "아우터", "신발", "액세서리", "좋아요"]
const majorCategories = ["상의", "하의", "아우터", "신발", "액세서리"]
const subCategories = {
  상의: ["티셔츠", "셔츠", "니트", "후드"],
  하의: ["청바지", "슬랙스", "반바지", "스커트"],
  아우터: ["자켓", "코트", "패딩", "가디건"],
  신발: ["스니커즈", "구두", "부츠", "샌들"],
  액세서리: ["가방", "모자", "시계", "벨트", "팔찌", "반지"],
}

const favoriteCategories = ["브랜드", "상품", "코디"]

const mockProducts = [
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
    category: "액세서리",
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
    category: "액세서리",
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
    category: "액세서리",
    image: "/placeholder.svg?height=200&width=200",
    liked: false,
  },
  {
    id: 11,
    name: "가죽 팔찌",
    price: "49,000원",
    category: "액세서리",
    image: "/placeholder.svg?height=200&width=200",
    liked: true,
  },
]

export default function SnapFitMobile() {
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedMajorCategory, setSelectedMajorCategory] = useState("")
  const [selectedFavoriteCategory, setSelectedFavoriteCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState(mockProducts)
  const [isMyPageOpen, setIsMyPageOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)
  const [codyItems, setCodyItems] = useState<{ [key: string]: any }>({})

  const addToCody = (product: any) => {
    const position = getCodyPosition(product.category, product.name)
    setCodyItems((prev) => ({
      ...prev,
      [position]: product,
    }))
  }

  const getCodyPosition = (category: string, name: string) => {
    switch (category) {
      case "상의":
        return "top"
      case "아우터":
        return "outer"
      case "하의":
        return "bottom"
      case "신발":
        return "shoes"
      case "액세서리":
        // 액세서리 내에서 세분화
        if (name.includes("모자") || name.includes("캡") || name.includes("햇")) {
          return "hat"
        } else if (name.includes("가방") || name.includes("백팩") || name.includes("크로스백")) {
          return "bag"
        } else if (name.includes("반지")) {
          return "ring"
        } else if (name.includes("팔찌")) {
          return "bracelet"
        } else {
          return "accessory"
        }
      default:
        return "accessory"
    }
  }

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

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "좋아요") {
      return product.liked
    }
    if (selectedMajorCategory && selectedMajorCategory !== "전체") {
      return product.category === selectedMajorCategory
    }
    if (selectedCategory !== "전체") {
      return product.category === selectedCategory
    }
    return true
  })

  const handleSwitchToSignup = () => {
    setIsLoginOpen(false)
    setIsSignupOpen(true)
  }

  const handleSwitchToLogin = () => {
    setIsSignupOpen(false)
    setIsLoginOpen(true)
  }

  // 코디 컴포넌트를 재사용 가능하게 분리
  const CodyDisplay = ({ isCompact = false }: { isCompact?: boolean }) => (
    <div
      className={`${isCompact ? "h-full bg-gray-800" : "flex-1 bg-gray-900"} relative flex items-center justify-center`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
      </div>

      {/* Cody Title - 상단 여백 최소화 */}

      {/* Cody Items Positioned - 상단 여백 완전 제거 */}
      <div className="relative w-full h-full">
        {/* Hat Position - 최상단 배치 */}
        <div className={`absolute ${isCompact ? "top-0" : "top-4"} left-1/2 transform -translate-x-1/2`}>
          {codyItems.hat ? (
            <div className="relative group">
              <img
                src={codyItems.hat.image || "/placeholder.svg"}
                alt={codyItems.hat.name}
                className={`${isCompact ? "w-10 h-10" : "w-16 h-16"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("hat")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-10 h-10" : "w-16 h-16"}`}></div>
          )}
        </div>

        {/* Top Position - 위치 상향 조정 */}
        <div className={`absolute ${isCompact ? "top-8" : "top-16"} left-1/2 transform -translate-x-1/2`}>
          {codyItems.top ? (
            <div className="relative group">
              <img
                src={codyItems.top.image || "/placeholder.svg"}
                alt={codyItems.top.name}
                className={`${isCompact ? "w-12 h-16" : "w-20 h-24"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("top")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-12 h-16" : "w-20 h-24"}`}></div>
          )}
        </div>

        {/* Bag Position - 위치 상향 조정 */}
        <div className={`absolute ${isCompact ? "top-14" : "top-24"} left-1/3 transform -translate-x-1/2`}>
          {codyItems.bag ? (
            <div className="relative group">
              <img
                src={codyItems.bag.image || "/placeholder.svg"}
                alt={codyItems.bag.name}
                className={`${isCompact ? "w-10 h-12" : "w-16 h-20"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("bag")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-10 h-12" : "w-16 h-20"}`}></div>
          )}
        </div>

        {/* Ring Position - 위치 상향 조정 */}
        <div className={`absolute ${isCompact ? "top-18" : "top-32"} right-1/3 transform translate-x-1/2`}>
          {codyItems.ring ? (
            <div className="relative group">
              <img
                src={codyItems.ring.image || "/placeholder.svg"}
                alt={codyItems.ring.name}
                className={`${isCompact ? "w-6 h-6" : "w-10 h-10"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-3 h-3" : "w-4 h-4"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("ring")}
              >
                <X className={`${isCompact ? "w-1.5 h-1.5" : "w-2 h-2"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-6 h-6" : "w-10 h-10"}`}></div>
          )}
        </div>

        {/* Bracelet Position - 위치 상향 조정 */}
        <div className={`absolute ${isCompact ? "top-18" : "top-32"} left-1/3 transform -translate-x-1/2`}>
          {codyItems.bracelet ? (
            <div className="relative group">
              <img
                src={codyItems.bracelet.image || "/placeholder.svg"}
                alt={codyItems.bracelet.name}
                className={`${isCompact ? "w-6 h-6" : "w-10 h-10"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-3 h-3" : "w-4 h-4"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("bracelet")}
              >
                <X className={`${isCompact ? "w-1.5 h-1.5" : "w-2 h-2"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-6 h-6" : "w-10 h-10"}`}></div>
          )}
        </div>

        {/* Outer Position - 위치 상향 조정 */}
        <div className={`absolute ${isCompact ? "top-6" : "top-12"} left-1/2 transform -translate-x-1/2 z-10`}>
          {codyItems.outer ? (
            <div className="relative group">
              <img
                src={codyItems.outer.image || "/placeholder.svg"}
                alt={codyItems.outer.name}
                className={`${isCompact ? "w-14 h-18" : "w-22 h-26"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("outer")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-14 h-18" : "w-22 h-26"}`}></div>
          )}
        </div>

        {/* Bottom Position - 위치 상향 조정 */}
        <div className={`absolute ${isCompact ? "bottom-8" : "bottom-16"} left-1/2 transform -translate-x-1/2`}>
          {codyItems.bottom ? (
            <div className="relative group">
              <img
                src={codyItems.bottom.image || "/placeholder.svg"}
                alt={codyItems.bottom.name}
                className={`${isCompact ? "w-12 h-16" : "w-20 h-24"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("bottom")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-12 h-16" : "w-20 h-24"}`}></div>
          )}
        </div>

        {/* Shoes Position - 위치 상향 조정 */}
        <div className={`absolute ${isCompact ? "bottom-1" : "bottom-2"} left-1/2 transform -translate-x-1/2`}>
          {codyItems.shoes ? (
            <div className="relative group">
              <img
                src={codyItems.shoes.image || "/placeholder.svg"}
                alt={codyItems.shoes.name}
                className={`${isCompact ? "w-16 h-10" : "w-24 h-16"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("shoes")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-16 h-10" : "w-24 h-16"}`}></div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Main Cody Display - 카테고리 창이 열렸을 때는 숨김 */}
      {!isProductPanelOpen && <CodyDisplay />}

      {/* Top Navigation Buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMyPageOpen(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <User className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCommunityOpen(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Users className="w-4 h-4" />
        </Button>
      </div>

      {/* Category Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsProductPanelOpen(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Grid3X3 className="w-4 h-4 mr-1" />
          카테고리
        </Button>
      </div>

      {/* Login Button (temporary for testing) */}
      <div className="absolute bottom-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLoginOpen(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          로그인
        </Button>
      </div>

      {/* Product Panel */}
      <Sheet open={isProductPanelOpen} onOpenChange={setIsProductPanelOpen}>
        <SheetContent side="bottom" className="h-screen rounded-t-3xl p-0">
          <div className="flex flex-col h-full">
            {/* X 버튼 추가 */}
            <div className="absolute top-2 right-2 z-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProductPanelOpen(false)}
                className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Compact Cody Display at Top - 정확히 50%, 상단 여백 제거 */}
            <div className="h-[30%] border-b">
              <CodyDisplay isCompact={true} />
            </div>

            {/* Product Selection Area - 정확히 50% */}
            <div className="h-[70%] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b bg-white">
                {!isSearchMode ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsSearchMode(true)}>
                        <Search className="w-4 h-4" />
                      </Button>
                      <div className="flex gap-2 overflow-x-auto">
                        {categories.map((category) => (
                          <Badge
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => {
                              setSelectedCategory(category)
                              setSelectedMajorCategory("")
                              setSelectedFavoriteCategory("")
                            }}
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      전체보기
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="상품 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => setIsSearchMode(false)}
                      autoFocus
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" onClick={() => setIsSearchMode(false)}>
                      취소
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Categories */}
                {selectedCategory !== "좋아요" && (
                  <div className="w-20 bg-gray-50 border-r overflow-y-auto">
                    <div className="p-2 space-y-1">
                      <Button
                        variant={selectedMajorCategory === "" ? "default" : "ghost"}
                        size="sm"
                        className="w-full text-xs h-8"
                        onClick={() => setSelectedMajorCategory("")}
                      >
                        전체
                      </Button>
                      {majorCategories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedMajorCategory === category ? "default" : "ghost"}
                          size="sm"
                          className="w-full text-xs h-8"
                          onClick={() => setSelectedMajorCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                  {selectedCategory === "좋아요" ? (
                    <div className="p-4">
                      <div className="flex">
                        {/* Left Side - Favorite Categories */}
                        <div className="w-24 space-y-2">
                          {favoriteCategories.map((favCategory) => (
                            <Button
                              key={favCategory}
                              variant={selectedFavoriteCategory === favCategory ? "default" : "ghost"}
                              size="sm"
                              className="w-full text-xs h-8"
                              onClick={() => setSelectedFavoriteCategory(favCategory)}
                            >
                              {favCategory}
                            </Button>
                          ))}
                        </div>

                        {/* Right Side - Favorite Items */}
                        <div className="flex-1 pl-4">
                          <div className="grid grid-cols-4 gap-3">
                            {filteredProducts.map((product) => (
                              <Card key={product.id} className="relative">
                                <CardContent className="p-2" onClick={() => addToCody(product)}>
                                  <img
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-full h-24 object-cover rounded mb-2"
                                  />
                                  <h3 className="text-xs font-medium truncate">{product.name}</h3>
                                  <p className="text-xs text-gray-600">{product.price}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-1 right-1 p-1 h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleLike(product.id)
                                    }}
                                  >
                                    <Heart
                                      className={`w-3 h-3 ${
                                        product.liked ? "fill-red-500 text-red-500" : "text-gray-400"
                                      }`}
                                    />
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="grid grid-cols-4 gap-3">
                        {filteredProducts.map((product) => (
                          <Card key={product.id} className="relative">
                            <CardContent className="p-2" onClick={() => addToCody(product)}>
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-24 object-cover rounded mb-2"
                              />
                              <h3 className="text-xs font-medium truncate">{product.name}</h3>
                              <p className="text-xs text-gray-600">{product.price}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 p-1 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleLike(product.id)
                                }}
                              >
                                <Heart
                                  className={`w-3 h-3 ${product.liked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                />
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* My Page */}
      <MyPage isOpen={isMyPageOpen} onClose={() => setIsMyPageOpen(false)} />

      {/* Login Page */}
      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSwitchToSignup={handleSwitchToSignup} />

      {/* Signup Page */}
      <SignupPage isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} onSwitchToLogin={handleSwitchToLogin} />

      {/* Community Page */}
      <CommunityPage isOpen={isCommunityOpen} onClose={() => setIsCommunityOpen(false)} />
    </div>
  )
}
