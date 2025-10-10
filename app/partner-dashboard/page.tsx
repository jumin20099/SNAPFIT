"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Package, BarChart3, FileText, CheckCircle, XCircle, Clock, Store, Plus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface PartnerDashboard {
  applicationStatus: "pending" | "approved" | "rejected"
  totalProducts: number
  approvedProducts: number
  pendingProducts: number
  rejectedProducts: number
  monthlyRevenue: number
  totalViewCount?: number
  totalActualViewCount?: number
  recentActivities: Array<{
    id: number
    type: string
    description: string
    date: string
  }>
  productViews?: Array<{ productId: number; productName: string; viewCount: number; actualViewCount: number }>
}

export default function PartnerDashboardPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ role?: string; email?: string; partner_application_id?: number } | null>(null)
  const [dashboard, setDashboard] = useState<PartnerDashboard>({
    applicationStatus: "pending",
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    rejectedProducts: 0,
    monthlyRevenue: 0,
    recentActivities: []
  })
  const [showProductDetails, setShowProductDetails] = useState(false)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user/info', {
          credentials: 'include' // HttpOnly 쿠키 자동 전송
        })
          if (response.ok) {
            const data = await response.json()
            setUserInfo(data)
            
            // PARTNER 또는 ADMIN 권한이 아니면 홈으로 리다이렉트
            if (data.role !== 'PARTNER' && data.role !== 'ADMIN') {
              router.push('/')
            }
          }
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error)
        router.push('/')
      }
    }

    fetchUserInfo()
  }, [router])

  useEffect(() => {
    if (userInfo) {
      loadDashboard()
    }
  }, [userInfo])

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token") || ""

      // 1) 사용자 info에서 partner_application_id 조회
      let partnerAppId: number | undefined = undefined
      if (userInfo?.partner_application_id) {
        partnerAppId = userInfo.partner_application_id
      }

      // 2) 대시보드 호출 (id 쿼리 파라미터 전달)
      const dashUrl = partnerAppId
        ? `/api/partner/dashboard?partnerApplicationId=${partnerAppId}`
        : "/api/partner/dashboard"

      const res = await fetch(dashUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (res.ok) {
        const data = await res.json()
        setDashboard(data)
      } else {
        console.error("대시보드 로드 실패:", res.status)
      }
    } catch (error) {
      console.error("대시보드 로드 실패:", error)
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

  if (!userInfo || (userInfo.role !== 'PARTNER' && userInfo.role !== 'ADMIN')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">제휴사 대시보드</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/partner-product-upload')}
        >
          <Plus className="w-4 h-4 mr-2" />
          상품 등록
        </Button>
      </div>

      <div className="p-4">
        {/* 상품 정보 요약 버튼 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">상품 정보 요약</h2>
                <p className="text-gray-600">클릭하여 상세 정보를 확인하세요</p>
              </div>
              <Button
                onClick={() => setShowProductDetails(!showProductDetails)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showProductDetails ? "숨기기" : "상세보기"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 상품 상세 정보 (버튼 클릭 시 표시) */}
        {showProductDetails && (
          <div className="space-y-6 mb-6">
            {/* 통계 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                  <CardTitle className="text-sm font-medium">거절된 상품</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{dashboard.rejectedProducts}</div>
                  <p className="text-xs text-muted-foreground">거절된 상품</p>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">누적 조회수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(dashboard.totalViewCount || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">승인 상품 기준 합계</p>
                </CardContent>
              </Card>
            </div>

            {/* 상품별 조회수 */}
            <Card>
              <CardHeader>
                <CardTitle>상품별 조회수</CardTitle>
              </CardHeader>
              <CardContent>
                {!(dashboard.productViews && dashboard.productViews.length) ? (
                  <div className="text-center py-4 text-sm text-gray-500">표시할 데이터가 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {dashboard.productViews!.map((pv) => (
                      <div key={pv.productId} className="flex items-center justify-between text-sm">
                        <div className="truncate pr-4">{pv.productName}</div>
                        <div className="flex items-center gap-4 whitespace-nowrap">
                          <span>누적 조회수 {pv.viewCount.toLocaleString()}회</span>
                          <span>실제 조회수(24h) {pv.actualViewCount.toLocaleString()}회</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 최근 활동 */}
        <Card className="mb-6">
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
        <Card className="mb-6">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                상품 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/partner-product-upload')}
              >
                <Plus className="w-4 h-4 mr-2" />
                새 상품 등록
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/partner-products')}
              >
                <Package className="w-4 h-4 mr-2" />
                상품 목록 보기
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                매출 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/partner-analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                매출 분석
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/partner-orders')}
              >
                <FileText className="w-4 h-4 mr-2" />
                주문 내역
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
