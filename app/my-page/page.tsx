"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Settings, Heart, Bookmark, ShoppingBag, LogOut, Edit, UserX, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useBlock } from "@/hooks/useBlock"

interface BlockedUser {
  blockedUserId: string;
  blockedUserNickname: string;
  reason?: string;
  createdAt: string;
}

export default function MyPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; role?: string } | null>(null)
  const [showBlockedUsers, setShowBlockedUsers] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const { getBlockedUsers, unblockUser, isLoading } = useBlock()

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

  const handleShowBlockedUsers = async () => {
    try {
      const users = await getBlockedUsers()
      setBlockedUsers(users)
      setShowBlockedUsers(true)
    } catch (error) {
      console.error('차단 목록 조회 실패:', error)
      alert('차단 목록을 불러올 수 없습니다.')
    }
  }

  const handleUnblockUser = async (userId: string, nickname: string) => {
    if (confirm(`'${nickname}'님의 차단을 해제하시겠습니까?`)) {
      const success = await unblockUser(userId)
      if (success) {
        alert('차단을 해제했습니다')
        // 목록에서 제거
        setBlockedUsers(prev => prev.filter(user => user.blockedUserId !== userId))
      }
    }
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
              
              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={handleShowBlockedUsers}
                data-testid="blocked-users-tab"
                disabled={isLoading}
              >
                <UserX className="w-5 h-5 mr-3 text-gray-500" />
                차단한 사용자 {isLoading && "(로딩중...)"}
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
      
      {/* 차단 목록 모달 */}
      {showBlockedUsers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" data-testid="blocked-users-list">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">차단한 사용자</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowBlockedUsers(false)}
              >
                ✕
              </Button>
            </div>
            
            {blockedUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">차단한 사용자가 없습니다</h3>
                <p className="text-gray-500">차단한 사용자가 있으면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  총 {blockedUsers.length}명의 사용자를 차단했습니다.
                </div>
                {blockedUsers.map((user) => (
                  <div 
                    key={user.blockedUserId} 
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    data-testid="blocked-user-item"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.blockedUserNickname}</div>
                        {user.reason && (
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              차단 사유: {user.reason}
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          차단일: {new Date(user.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnblockUser(user.blockedUserId, user.blockedUserNickname)}
                      disabled={isLoading}
                      data-testid="unblock-user-button"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          처리중...
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <UserX className="w-4 h-4" />
                          차단해제
                        </div>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
