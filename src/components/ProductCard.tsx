import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Product {
  id: number
  name: string
  price: string
  category: string
  image: string
  liked: boolean
}

interface ProductCardProps {
  product: Product
  onAddToCody: (product: Product) => void
  onToggleLike: (productId: number) => void
}

export default function ProductCard({ product, onAddToCody, onToggleLike }: ProductCardProps) {
  return (
    <Card className="relative">
      <CardContent className="p-2" onClick={() => onAddToCody(product)}>
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
            onToggleLike(product.id)
          }}
        >
          <Heart
            className={`w-3 h-3 ${product.liked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
          />
        </Button>
      </CardContent>
    </Card>
  )
} 