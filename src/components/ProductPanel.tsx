import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { categories, majorCategories, subCategoryDetails } from "@/data/categories"
import CodyDisplay from "./CodyDisplay"
import ProductCard from "./ProductCard"

interface Product {
  id: number
  name: string
  price: string
  category: string
  image: string
  liked: boolean
}

interface ProductPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  codyItems: { [key: string]: Product }
  removeCodyItem: (position: string) => void
  products: Product[]
  onToggleLike: (productId: number) => void
  onAddToCody: (product: Product) => void
}

export default function ProductPanel({
  isOpen,
  onOpenChange,
  codyItems,
  removeCodyItem,
  products,
  onToggleLike,
  onAddToCody,
}: ProductPanelProps) {
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedMajorCategory, setSelectedMajorCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = products.filter((product) => {
    if (selectedMajorCategory === "좋아요") {
      return product.liked
    }
    if (selectedMajorCategory && selectedMajorCategory !== "좋아요") {
      return product.category === selectedMajorCategory
    }
    return true
  })

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-screen rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          {/* X 버튼 추가 */}
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

          {/* Compact Cody Display at Top */}
          <div className="h-[30%] border-b">
            <CodyDisplay codyItems={codyItems} removeCodyItem={removeCodyItem} isCompact={true} />
          </div>

          {/* Product Selection Area */}
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
                            setSelectedSubCategory("")
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
              {/* Left Sidebar - Major Categories */}
              <div className="w-20 bg-gray-50 border-r overflow-y-auto">
                <div className="p-2 space-y-1">
                  {majorCategories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedMajorCategory === category ? "default" : "ghost"}
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => {
                        setSelectedMajorCategory(category)
                        setSelectedSubCategory("")
                      }}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                {selectedMajorCategory === "좋아요" ? (
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-3">
                      {products
                        .filter((product) => product.liked)
                        .map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCody={onAddToCody}
                            onToggleLike={onToggleLike}
                          />
                        ))}
                    </div>
                  </div>
                ) : selectedMajorCategory &&
                  subCategoryDetails[selectedMajorCategory as keyof typeof subCategoryDetails] ? (
                  <div className="p-4">
                    {/* 선택된 카테고리 제목 */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold">{selectedMajorCategory}</h2>
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        전체보기
                      </Button>
                    </div>

                    {/* 세부 카테고리 그리드 */}
                    <div className="grid grid-cols-3 gap-4">
                      {subCategoryDetails[selectedMajorCategory as keyof typeof subCategoryDetails].map(
                        (subCategory, index) => (
                          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-3 text-center">
                              <div className="w-full h-20 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                                <img
                                  src={subCategory.image || "/placeholder.svg"}
                                  alt={subCategory.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <h3 className="text-xs font-medium">{subCategory.name}</h3>
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-3">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCody={onAddToCody}
                          onToggleLike={onToggleLike}
                        />
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
  )
} 