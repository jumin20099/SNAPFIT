"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Package, BarChart3, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PartnerDashboard {
  applicationStatus: "pending" | "approved" | "rejected"
  totalProducts: number
  approvedProducts: number
  pendingProducts: number
  rejectedProducts: number
  monthlyRevenue: number
  recentActivities: Array<{
    id: number
    type: string
    description: string
    date: string
  }>
}

interface PartnerDashboardPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function PartnerDashboardPage({ isOpen, onClose }: PartnerDashboardPageProps) {
  const [dashboard, setDashboard] = useState<PartnerDashboard>({
    applicationStatus: "pending",
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    rejectedProducts: 0,
    monthlyRevenue: 0,
    recentActivities: []
  })

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/partner/dashboard", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setDashboard(data)
      } else {
        console.error("대시보드 로드 실패:", res.status)
        // API 실패 시 기본 데이터 사용
        setDashboard({
          applicationStatus: "pending",
          totalProducts: 0,
          approvedProducts: 0,
          pendingProducts: 0,
          rejectedProducts: 0,
          monthlyRevenue: 0,
          recentActivities: []
        })
      }
    } catch (error) {
      console.error("대시보드 로드 실패:", error)
      // 에러 시 기본 데이터 사용
      setDashboard({
        applicationStatus: "pending",
        totalProducts: 0,
        approvedProducts: 0,
        pendingProducts: 0,
        rejectedProducts: 0,
        monthlyRevenue: 0,
        recentActivities: []
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            검토중
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            승인
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            거절
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 상품</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard.totalProducts}</div>
                <p className="text-xs text-muted-foreground">등록된 상품 수</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인된 상품</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboard.approvedProducts}</div>
                <p className="text-xs text-muted-foreground">판매 중인 상품</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">검토 중</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{dashboard.pendingProducts}</div>
                <p className="text-xs text-muted-foreground">승인 대기 상품</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboard.monthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">월간 총 매출</p>
              </CardContent>
            </Card>
          </div>

          {/* 상품 상태 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>상품 상태 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">승인된 상품</span>
                  </div>
                  <span className="text-sm font-medium">{dashboard.approvedProducts}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">검토 중인 상품</span>
                  </div>
                  <span className="text-sm font-medium">{dashboard.pendingProducts}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">거절된 상품</span>
                  </div>
                  <span className="text-sm font-medium">{dashboard.rejectedProducts}개</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 최근 활동 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recentActivities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">아직 활동이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 제휴사 상태 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>제휴사 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">신청 상태</span>
                  {getStatusBadge(dashboard.applicationStatus)}
                </div>
                {dashboard.applicationStatus === "rejected" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      제휴사 신청이 거절되었습니다. 자세한 사유는 관리자에게 문의해주세요.
                    </p>
                  </div>
                )}
                {dashboard.applicationStatus === "approved" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      제휴사 신청이 승인되었습니다. 이제 상품을 등록할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 