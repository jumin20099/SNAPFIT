import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodyItem {
  id: number
  name: string
  price: string
  category: string
  image: string
  liked: boolean
}

interface CodyDisplayProps {
  codyItems: { [key: string]: CodyItem }
  removeCodyItem: (position: string) => void
  isCompact?: boolean
}

export default function CodyDisplay({ codyItems, removeCodyItem, isCompact = false }: CodyDisplayProps) {
  return (
    <div
      className={`${isCompact ? "h-full bg-gray-800" : "flex-1 bg-gray-900"} relative flex items-center justify-center`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
      </div>

      {/* Cody Items Positioned */}
      <div className="relative w-full h-full">
        {/* Hat Position */}
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

        {/* Top Position */}
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

        {/* Bag Position */}
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

        {/* Ring Position */}
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

        {/* Bracelet Position */}
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

        {/* Outer Position */}
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

        {/* Bottom Position */}
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

        {/* Shoes Position */}
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
} 