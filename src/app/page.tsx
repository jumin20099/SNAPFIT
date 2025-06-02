"use client"

import { Button } from "@/components/ui/button"
import { HeaderNav } from "@/components/HeaderNav"
import { CodyDisplayContainer } from "@/components/CodyDisplayContainer"
import { ProductSheetContainer } from "@/components/ProductSheetContainer"
import { AuthModalsContainer } from "@/components/AuthModalsContainer"
import CommunityPage from "@/components/community-page"
import { useModals } from "@/contexts/ModalContext"

export default function Home() {
  const {
    isProductPanelOpen,
    setIsProductPanelOpen,
    setIsMyPageOpen,
    setIsCommunityOpen,
    setIsLoginOpen,
    isCommunityOpen,
  } = useModals()

  return (
    <div className="h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {!isProductPanelOpen && <CodyDisplayContainer />}

      <HeaderNav
        onMyPageClick={() => setIsMyPageOpen(true)}
        onCommunityClick={() => setIsCommunityOpen(true)}
        onCategoryClick={() => setIsProductPanelOpen(true)}
      />

      <div className="absolute bottom-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLoginOpen(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          로그인
        </Button>
      </div>

      <ProductSheetContainer
        open={isProductPanelOpen}
        onOpenChange={setIsProductPanelOpen}
      />

      <AuthModalsContainer />
      <CommunityPage />
    </div>
  )
}
