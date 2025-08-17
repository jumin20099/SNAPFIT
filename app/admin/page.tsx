"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Settings, Users, Store, Package, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ role?: string; email?: string } | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0,
    totalProducts: 0,
    pendingApplications: 0
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
            
            // ADMIN 권한이 아니면 홈으로 리다이렉트
            if (data.role !== 'ADMIN') {
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
    // 어드민 통계 데이터 가져오기
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch('/api/admin/dashboard', {
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

  if (!userInfo || userInfo.role !== 'ADMIN') {
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
        <h1 className="text-lg font-semibold">어드민 대시보드</h1>
        <div className="w-10" />
      </div>

      <div className="p-4">
        {/* Welcome Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-red-600" />
              <div>
                <h2 className="text-xl font-semibold">안녕하세요, {userInfo.email}님!</h2>
                <p className="text-gray-600">어드민 대시보드에서 플랫폼을 관리하세요.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">총 사용자</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">총 제휴사</p>
                  <p className="text-2xl font-bold">{stats.totalPartners}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" />
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
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">대기 신청</p>
                  <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                제휴사 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/admin/partner-applications')}
              >
                <Clock className="w-4 h-4 mr-2" />
                제휴사 신청 관리
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/admin/partner-status')}
              >
                <Store className="w-4 h-4 mr-2" />
                제휴사 상태 관리
              </Button>
            </CardContent>
          </Card>

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
                onClick={() => router.push('/admin/product-approvals')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                상품 승인 관리
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/admin/products')}
              >
                <Package className="w-4 h-4 mr-2" />
                전체 상품 관리
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">새 제휴사가 승인되었습니다</p>
                  <p className="text-sm text-gray-600">방금 전</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
                <div className="flex-1">
                  <p className="font-medium">부적절한 상품이 거부되었습니다</p>
                  <p className="text-sm text-gray-600">10분 전</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium">새 제휴사 신청이 접수되었습니다</p>
                  <p className="text-sm text-gray-600">30분 전</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">새 사용자가 가입했습니다</p>
                  <p className="text-sm text-gray-600">1시간 전</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">데이터베이스</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">API 서버</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">파일 스토리지</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">이메일 서비스</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
