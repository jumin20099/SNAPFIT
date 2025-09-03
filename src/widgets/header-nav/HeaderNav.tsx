"use client"

import { User, Users, Grid3X3, Store, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface HeaderNavProps {
  onMyPageClick: () => void
  onCommunityClick: () => void
  onCategoryClick: () => void
  onPartnerClick: () => void
  onNotificationClick: () => void
  unreadNotificationCount?: number
}

export const HeaderNav = ({ 
  onMyPageClick, 
  onCommunityClick, 
  onCategoryClick, 
  onPartnerClick, 
  onNotificationClick,
  unreadNotificationCount = 0
}: HeaderNavProps) => {
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
        <Button
          variant="outline"
          size="sm"
          onClick={onNotificationClick}
          className="bg-white/90 backdrop-blur-sm relative"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </Badge>
          )}
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