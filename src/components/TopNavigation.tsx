import { User, Users, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopNavigationProps {
  onMyPageClick: () => void
  onCommunityClick: () => void
  onCategoryClick: () => void
}

export default function TopNavigation({ onMyPageClick, onCommunityClick, onCategoryClick }: TopNavigationProps) {
  return (
    <>
      {/* Top Navigation Buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onMyPageClick}
          className="bg-white/90 backdrop-blur-sm"
        >
          <User className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCommunityClick}
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
          onClick={onCategoryClick}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Grid3X3 className="w-4 h-4 mr-1" />
          카테고리
        </Button>
      </div>
    </>
  )
} 