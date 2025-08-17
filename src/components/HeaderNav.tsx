"use client"

import { User, Users, Grid3X3, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface HeaderNavProps {
  onMyPageClick: () => void
  onCommunityClick: () => void
  onCategoryClick: () => void
  onPartnerClick: () => void
}

export const HeaderNav = ({ onMyPageClick, onCommunityClick, onCategoryClick, onPartnerClick }: HeaderNavProps) => {
  const router = useRouter()

  const handleCommunityClick = () => {
    router.push('/community')
  }

  return (
    <>
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
          onClick={handleCommunityClick}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Users className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPartnerClick}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Store className="w-4 h-4" />
        </Button>
      </div>

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