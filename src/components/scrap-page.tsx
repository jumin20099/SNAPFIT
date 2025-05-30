"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScrapPageProps {
  onBack: () => void
}

export default function ScrapPage({ onBack }: ScrapPageProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">스크랩</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg">스크랩한 항목이 없습니다</p>
          <p className="text-sm mt-2">관심있는 상품이나 코디를 스크랩해보세요</p>
        </div>
      </div>
    </div>
  )
}
