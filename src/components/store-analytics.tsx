"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, XCircle, Power, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStoreAnalytics, toggleStoreStatus, markStoreCommissionPaid } from "../actions/admin-actions"

interface StoreAnalytics {
  store_id: number
  store_name: string
  total_sales: number
  commission_owed: number
  commission_paid: number
  payment_status: "paid" | "pending" | "overdue"
  payment_due_date: string
  is_active: boolean
}

interface StoreAnalyticsPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function StoreAnalyticsPage({ isOpen, onClose }: StoreAnalyticsPageProps) {
  const [analytics, setAnalytics] = useState<StoreAnalytics[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAnalytics()
    }
  }, [isOpen])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const data = await getStoreAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error("분석 데이터 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStoreStatus = async (storeId: number, isActive: boolean) => {
    const result = await toggleStoreStatus(storeId, isActive)
    if (result.success) {
      alert(result.message)
      loadAnalytics()
    } else {
      alert(result.message)
    }
  }

  const handleMarkPaid = async (storeId: number) => {
    if (confirm("수수료 납부를 완료 처리하시겠습니까?")) {
      const result = await markStoreCommissionPaid(storeId)
      if (result.success) {
        alert(result.message)
        loadAnalytics()
      } else {
        alert(result.message)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">납부완료</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">납부대기</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">연체</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const activeStores = analytics.filter((p) => p.is_active)
  const inactiveStores = analytics.filter((p) => !p.is_active)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">제휴사 분석</h1>
        </div>
        <Badge variant="secondary">Store Analytics</Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">총 매출</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.reduce((sum, item) => sum + item.total_sales, 0))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">미납 수수료</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    analytics.reduce((sum, item) => sum + (item.commission_owed - item.commission_paid), 0),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">활성 제휴사</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeStores.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">비활성 제휴사</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{inactiveStores.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* 활성 제휴사 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              활성 제휴사 ({activeStores.length})
            </h2>

            {loading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : (
              <div className="space-y-4">
                {activeStores.map((store) => (
                  <Card key={store.store_id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{store.store_name}</h3>
                          <div className="flex items-center gap-2">
                            {getPaymentStatusBadge(store.payment_status)}
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              활성
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">총 매출:</span>
                            <div className="font-medium">{formatCurrency(store.total_sales)}</div>
                          </div>

                          <div>
                            <span className="text-gray-600">수수료 총액:</span>
                            <div className="font-medium">{formatCurrency(store.commission_owed)}</div>
                          </div>

                          <div>
                            <span className="text-gray-600">납부 완료:</span>
                            <div className="font-medium text-green-600">{formatCurrency(store.commission_paid)}</div>
                          </div>

                          <div>
                            <span className="text-gray-600">미납 금액:</span>
                            <div className="font-medium text-red-600">
                              {formatCurrency(store.commission_owed - store.commission_paid)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-gray-600">납부 기한: {store.payment_due_date}</div>
                          <div className="flex items-center gap-2">
                            {store.payment_status !== "paid" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkPaid(store.store_id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                납부완료 처리
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStoreStatus(store.store_id, false)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <PowerOff className="w-4 h-4 mr-1" />
                              판매중지
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 비활성 제휴사 */}
          {inactiveStores.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                비활성 제휴사 ({inactiveStores.length})
              </h2>

              <div className="space-y-4">
                {inactiveStores.map((store) => (
                  <Card key={store.store_id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-700">{store.store_name}</h3>
                          <div className="flex items-center gap-2">
                            {getPaymentStatusBadge(store.payment_status)}
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              비활성
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">총 매출:</span>
                            <div className="font-medium">{formatCurrency(store.total_sales)}</div>
                          </div>

                          <div>
                            <span className="text-gray-600">미납 금액:</span>
                            <div className="font-medium text-red-600">
                              {formatCurrency(store.commission_owed - store.commission_paid)}
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-600">납부 기한:</span>
                            <div className="font-medium text-red-600">{store.payment_due_date} (연체)</div>
                          </div>

                          <div className="flex items-center justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStoreStatus(store.store_id, true)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Power className="w-4 h-4 mr-1" />
                              일괄활성화
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
