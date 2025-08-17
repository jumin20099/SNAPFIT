"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Store, Package, TrendingUp, Users, DollarSign, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function PartnerDashboardPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ role?: string; email?: string } | null>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalViews: 0,
    totalOrders: 0
  })

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch('/api/user/info', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setUserInfo(data)
            
            // PARTNER 권한이 아니면 홈으로 리다이렉트
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
    // 제휴사 통계 데이터 가져오기
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch('/api/partner/dashboard', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setStats(data)
          }
        }
      } catch (error) {
        console.error('통계 데이터 가져오기 실패:', error)
      }
    }

    fetchStats()
  }, [])

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
        {/* Welcome Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">안녕하세요, {userInfo.email}님!</h2>
                <p className="text-gray-600">제휴사 대시보드에서 상품과 매출을 관리하세요.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">총 상품</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold">₩{stats.totalSales.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">총 조회수</p>
                  <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">총 주문</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <TrendingUp className="w-5 h-5" />
                매출 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/partner-analytics')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                매출 분석
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/partner-orders')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                주문 내역
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">새 상품이 등록되었습니다</p>
                  <p className="text-sm text-gray-600">방금 전</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">매출이 증가했습니다</p>
                  <p className="text-sm text-gray-600">1시간 전</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-500" />
                <div className="flex-1">
                  <p className="font-medium">상품 조회수가 증가했습니다</p>
                  <p className="text-sm text-gray-600">2시간 전</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
