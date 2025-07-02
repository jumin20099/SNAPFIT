import { useState } from "react"

export const useCody = () => {
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

  return {
    codyItems,
    addToCody,
    removeCodyItem,
  }
} 