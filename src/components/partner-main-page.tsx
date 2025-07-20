"use client"

import { useState } from "react"
import { Store, Package, BarChart3, FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PartnerProductUploadPage from "./partner-product-upload-page"
import PartnerDashboardPage from "./partner-dashboard-page"

interface PartnerMainPageProps {
  isOpen: boolean
  onClose: () => void
  userRole?: string // 추가
}

export default function PartnerMainPage({ isOpen, onClose, userRole }: PartnerMainPageProps) {
  const [activeTab, setActiveTab] = useState("dashboard")

  if (!isOpen) return null
  if (userRole == "USER") {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">권한이 없습니다.</h2>
            <p className="text-gray-600">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
            <Button className="mt-4" onClick={onClose}>닫기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <User className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">제휴사 관리</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="products">상품 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="h-full m-0 p-4">
            <PartnerDashboardPage isOpen={true} onClose={() => setActiveTab("dashboard")} />
          </TabsContent>

          <TabsContent value="products" className="h-full m-0">
            <PartnerProductUploadPage isOpen={true} onClose={() => setActiveTab("dashboard")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 