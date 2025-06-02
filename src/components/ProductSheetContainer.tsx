"use client"

import { Search, Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CodyDisplayContainer } from "./CodyDisplayContainer"
import { useProducts } from "@/hooks/useProducts"
import { useCody } from "@/hooks/useCody"
import { categories, majorCategories, favoriteCategories } from "@/data/mockProducts"

interface ProductSheetContainerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ProductSheetContainer = ({ open, onOpenChange }: ProductSheetContainerProps) => {
  const {
    isSearchMode,
    setIsSearchMode,
    selectedCategory,
    setSelectedCategory,
    selectedMajorCategory,
    setSelectedMajorCategory,
    selectedFavoriteCategory,
    setSelectedFavoriteCategory,
    searchQuery,
    setSearchQuery,
    toggleLike,
    filteredProducts,
  } = useProducts()

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

              <div className="flex-1 overflow-y-auto">
                {selectedCategory === "좋아요" ? (
                  <div className="p-4">
                    <div className="flex">
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
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 