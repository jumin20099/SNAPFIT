import { useState } from "react"
import { mockProducts } from "@/data/mockProducts"

export const useProducts = () => {
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedMajorCategory, setSelectedMajorCategory] = useState("")
  const [selectedFavoriteCategory, setSelectedFavoriteCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState(mockProducts)

  const toggleLike = (productId: number) => {
    setProducts(products.map((product) => 
      product.id === productId ? { ...product, liked: !product.liked } : product
    ))
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

  return {
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
    products,
    setProducts,
    toggleLike,
    filteredProducts,
  }
} 