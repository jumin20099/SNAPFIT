"use client"

import { useState } from "react"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CodyItem {
  id: number
  name: string
  category: string
  image: string
  position: "hat" | "top" | "bottom" | "shoes" | "bag" | "necklace" | "accessory"
}

const categories = ["전체", "모자", "상의", "하의", "신발", "가방", "목걸이", "반지", "팔찌"]

interface CodySystemProps {
  isOpen: boolean
  onClose: () => void
}

export default function CodySystem({ isOpen, onClose }: CodySystemProps) {
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: CodyItem }>({})
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [availableItems, setAvailableItems] = useState<CodyItem[]>([])

  const addItemToCody = (item: CodyItem) => {
    setSelectedItems((prev) => ({
      ...prev,
      [item.position]: item,
    }))
  }

  const removeItemFromCody = (position: string) => {
    setSelectedItems((prev) => {
      const newItems = { ...prev }
      delete newItems[position]
      return newItems
    })
  }

  const filteredItems = availableItems.filter((item) => {
    if (selectedCategory === "전체") return true
    return item.category === selectedCategory
  })

  const saveCody = () => {

    alert("코디가 저장되었습니다!")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">코디 시스템</h1>
        </div>
        <Button onClick={saveCody} size="sm" className="bg-blue-600 hover:bg-blue-700">
          저장
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Cody Display Area */}
        <div className="flex-1 bg-gray-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          </div>

          {/* Cody Title */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <h2 className="text-white text-lg font-bold bg-black/50 px-4 py-2 rounded-lg">{"<나의 코디>"}</h2>
          </div>

          {/* Cody Items Positioned */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Hat Position */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
              {selectedItems.hat ? (
                <div className="relative group">
                  <img
                    src={selectedItems.hat.image || "/placeholder.svg"}
                    alt={selectedItems.hat.name}
                    className="w-20 h-20 object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItemFromCody("hat")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>

            {/* Necklace Position */}
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
              {selectedItems.necklace ? (
                <div className="relative group">
                  <img
                    src={selectedItems.necklace.image || "/placeholder.svg"}
                    alt={selectedItems.necklace.name}
                    className="w-16 h-16 object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItemFromCody("necklace")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-16 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>

            {/* Top Position */}
            <div className="absolute top-40 left-1/2 transform -translate-x-1/2">
              {selectedItems.top ? (
                <div className="relative group">
                  <img
                    src={selectedItems.top.image || "/placeholder.svg"}
                    alt={selectedItems.top.name}
                    className="w-24 h-28 object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItemFromCody("top")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-28 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>

            {/* Bag Position (Left side of top) */}
            <div className="absolute top-40 left-1/4 transform -translate-x-1/2">
              {selectedItems.bag ? (
                <div className="relative group">
                  <img
                    src={selectedItems.bag.image || "/placeholder.svg"}
                    alt={selectedItems.bag.name}
                    className="w-20 h-24 object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItemFromCody("bag")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-24 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-gray-500" />
                </div>
              )}
            </div>

            {/* Accessory Position (Right side) */}
            <div className="absolute top-48 right-1/4 transform translate-x-1/2">
              {selectedItems.accessory ? (
                <div className="relative group">
                  <img
                    src={selectedItems.accessory.image || "/placeholder.svg"}
                    alt={selectedItems.accessory.name}
                    className="w-12 h-12 object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItemFromCody("accessory")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-12 h-12 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </div>

            {/* Bottom Position */}
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
              {selectedItems.bottom ? (
                <div className="relative group">
                  <img
                    src={selectedItems.bottom.image || "/placeholder.svg"}
                    alt={selectedItems.bottom.name}
                    className="w-24 h-28 object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItemFromCody("bottom")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-28 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>

            {/* Shoes Position */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              {selectedItems.shoes ? (
                <div className="relative group">
                  <img
                    src={selectedItems.shoes.image || "/placeholder.svg"}
                    alt={selectedItems.shoes.name}
                    className="w-28 h-20 object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItemFromCody("shoes")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-28 h-20 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Selection Panel */}
        <div className="w-80 bg-white border-l flex flex-col">
          {/* Category Filter */}
          <div className="p-4 border-b">
            <h3 className="font-medium mb-3">카테고리</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3" onClick={() => addItemToCody(item)}>
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-20 object-contain mb-2 bg-gray-50 rounded"
                    />
                    <h4 className="text-xs font-medium truncate">{item.name}</h4>
                    <p className="text-xs text-gray-600">{item.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
