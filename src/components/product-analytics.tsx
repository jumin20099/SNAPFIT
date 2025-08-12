"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, TrendingUp, Eye, ShoppingCart, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProductAnalytics } from "../actions/admin-actions"

interface ProductAnalytics {
  product_id: number
  product_name: string
  view_count: number
  actual_view_count?: number
  purchase_count: number
  total_sales: number
  conversion_rate: number
}

interface ProductAnalyticsPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProductAnalyticsPage({ isOpen, onClose }: ProductAnalyticsPageProps) {
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"sales" | "views" | "purchases" | "conversion">("sales")

  useEffect(() => {
    if (isOpen) {
      loadAnalytics()
    }
  }, [isOpen])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const data = await getProductAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error("분석 데이터 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSortedAnalytics = () => {
    return [...analytics].sort((a, b) => {
      switch (sortBy) {
        case "sales":
          return b.total_sales - a.total_sales
        case "views":
          return b.view_count - a.view_count
        case "purchases":
          return b.purchase_count - a.purchase_count
        case "conversion":
          return b.conversion_rate - a.conversion_rate
        default:
          return 0
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">상품 분석</h1>
        </div>
        <Badge variant="secondary">Analytics</Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Eye className="w-4 h-4" />총 조회수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.reduce((sum, item) => sum + item.view_count, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Eye className="w-4 h-4" />실제 조회수(12h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.reduce((sum, item) => sum + (item.actual_view_count || 0), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />총 구매수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.reduce((sum, item) => sum + item.purchase_count, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />총 매출
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.reduce((sum, item) => sum + item.total_sales, 0))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  평균 전환율
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.length > 0
                    ? (analytics.reduce((sum, item) => sum + item.conversion_rate, 0) / analytics.length).toFixed(1)
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 정렬 옵션 */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: "sales", label: "매출순" },
              { key: "views", label: "조회수순" },
              { key: "purchases", label: "구매수순" },
              { key: "conversion", label: "전환율순" },
            ].map((option) => (
              <Badge
                key={option.key}
                variant={sortBy === option.key ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSortBy(option.key as any)}
              >
                {option.label}
              </Badge>
            ))}
          </div>

          {/* 상품별 분석 데이터 */}
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <div className="space-y-4">
              {getSortedAnalytics().map((item) => (
                <Card key={item.product_id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{item.product_name}</h3>
                        <Badge variant={item.conversion_rate > 5 ? "default" : "secondary"}>
                          전환율 {item.conversion_rate}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">조회수:</span>
                          <span className="font-medium">{item.view_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">실제(12h):</span>
                          <span className="font-medium">{(item.actual_view_count || 0).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">구매수:</span>
                          <span className="font-medium">{item.purchase_count.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">매출:</span>
                          <span className="font-medium">{formatCurrency(item.total_sales)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">전환율:</span>
                          <span className="font-medium">{item.conversion_rate}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
