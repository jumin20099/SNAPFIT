"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Settings, Heart, Bookmark, ShoppingBag, LogOut, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function MyPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; role?: string } | null>(null)

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
          }
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error)
      }
    }

    fetchUserInfo()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
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
        <h1 className="text-lg font-semibold">마이페이지</h1>
        <div className="w-10" />
      </div>

      {/* User Profile */}
      <div className="p-4">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{userInfo?.name || '사용자'}</h2>
                <p className="text-gray-600">{userInfo?.email || '이메일 없음'}</p>
                <p className="text-sm text-blue-600">{userInfo?.role || 'USER'}</p>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                편집
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => router.push('/liked-products')}
              >
                <Heart className="w-5 h-5 mr-3 text-red-500" />
                좋아요한 상품
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => router.push('/scrap')}
              >
                <Bookmark className="w-5 h-5 mr-3 text-blue-500" />
                스크랩
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => router.push('/my-cody')}
              >
                <ShoppingBag className="w-5 h-5 mr-3 text-green-500" />
                내 코디
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => router.push('/notification')}
              >
                <Settings className="w-5 h-5 mr-3 text-gray-500" />
                설정
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                로그아웃
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
