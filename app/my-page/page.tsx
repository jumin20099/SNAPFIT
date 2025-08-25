"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, User, Settings, Heart, Bookmark, ShoppingBag, LogOut, Edit, UserX, Shield, Camera, Check, X, Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useBlock } from "@/hooks/useBlock"
import { useProfile } from "@/hooks/useProfile"
import { useTheme } from "@/contexts/ThemeContext"

interface BlockedUser {
  blockedUserId: string;
  blockedUserNickname: string;
  reason?: string;
  createdAt: string;
}

export default function MyPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ userIdx?: string; nickname?: string; email?: string; role?: string; profileImage?: string } | null>(null)
  const [showBlockedUsers, setShowBlockedUsers] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [tempNickname, setTempNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const { getBlockedUsers, unblockUser, isLoading: blockLoading } = useBlock()
  const { updateNickname, uploadProfileImage, updateProfileImageUrl, isLoading: profileLoading, uploadProgress } = useProfile()
  const { theme, setTheme, actualTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // 프로필 사진 변경
  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setSuccessMessage('')
      const imageUrl = await uploadProfileImage(file)
      const updatedUser = await updateProfileImageUrl(imageUrl)
      
      setUserInfo(prev => prev ? {
        ...prev,
        profileImage: updatedUser.profileImage
      } : null)
      
      setSuccessMessage('프로필 사진이 변경되었습니다')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      alert(error instanceof Error ? error.message : '프로필 사진 변경에 실패했습니다')
    }
  }

  // 닉네임 편집 시작
  const handleStartEditNickname = () => {
    setTempNickname(userInfo?.nickname || '')
    setIsEditingNickname(true)
    setNicknameError('')
  }

  // 닉네임 편집 취소
  const handleCancelEditNickname = () => {
    setIsEditingNickname(false)
    setTempNickname('')
    setNicknameError('')
  }

  // 닉네임 저장
  const handleSaveNickname = async () => {
    try {
      setNicknameError('')
      setSuccessMessage('')

      // 클라이언트 사이드 유효성 검사
      if (tempNickname.length < 2 || tempNickname.length > 20) {
        setNicknameError('닉네임은 2자 이상 20자 이하여야 합니다')
        return
      }

      if (!/^[가-힣a-zA-Z0-9\s]+$/.test(tempNickname)) {
        setNicknameError('한글, 영문, 숫자만 사용할 수 있습니다')
        return
      }

      const updatedUser = await updateNickname(tempNickname)
      
      setUserInfo(prev => prev ? {
        ...prev,
        nickname: updatedUser.nickname
      } : null)
      
      setIsEditingNickname(false)
      setSuccessMessage('닉네임이 변경되었습니다')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('중복')) {
          setNicknameError('이미 사용 중인 닉네임입니다')
        } else {
          setNicknameError(error.message)
        }
      } else {
        setNicknameError('닉네임 변경에 실패했습니다')
      }
    }
  }

  // 다크모드 토글 아이콘
  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-5 h-5" />
      case 'dark': return <Moon className="w-5 h-5" />
      case 'system': return <Monitor className="w-5 h-5" />
    }
  }

  // 다크모드 토글
  const handleThemeToggle = () => {
    const nextTheme: 'light' | 'dark' | 'system' = 
      theme === 'light' ? 'dark' : 
      theme === 'dark' ? 'system' : 'light'
    setTheme(nextTheme)
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

      {/* Success Message */}
      {successMessage && (
        <div className="p-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" data-testid="profile-update-success">
            {successMessage}
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {/* 프로필 이미지 */}
              <div className="relative">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden" data-testid="profile-image">
                  {userInfo?.profileImage ? (
                    <img 
                      src={userInfo.profileImage} 
                      alt="프로필 사진" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                
                {/* 프로필 사진 변경 버튼 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={profileLoading}
                  data-testid="change-profile-image-button"
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:opacity-50"
                >
                  {profileLoading ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" data-testid="profile-upload-loading" />
                  ) : (
                    <Camera className="w-3 h-3" />
                  )}
                </button>
                
                {/* 업로드 진행률 */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">{uploadProgress}%</span>
                  </div>
                )}
                
                {/* 숨겨진 파일 입력 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  data-testid="profile-image-input"
                />
              </div>
              
              {/* 사용자 정보 */}
              <div className="flex-1">
                {/* 닉네임 */}
                <div className="flex items-center gap-2 mb-2">
                  {isEditingNickname ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={tempNickname}
                        onChange={(e) => setTempNickname(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="닉네임을 입력하세요"
                        maxLength={20}
                        autoFocus
                        data-testid="nickname-input"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveNickname}
                        disabled={profileLoading}
                        data-testid="save-nickname-button"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        {profileLoading ? (
                          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" data-testid="nickname-save-loading" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditNickname}
                        data-testid="cancel-nickname-button"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold" data-testid="current-nickname">
                        {userInfo?.nickname || '사용자'}
                      </h2>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleStartEditNickname}
                        data-testid="edit-nickname-button"
                        className="p-1 h-auto"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {/* 닉네임 에러 메시지 */}
                {nicknameError && (
                  <p className="text-red-500 text-sm mb-2" data-testid="nickname-error-message">
                    {nicknameError}
                  </p>
                )}
                
                {/* 닉네임 유효성 검사 에러 */}
                {isEditingNickname && tempNickname && (
                  <>
                    {tempNickname.length < 2 && (
                      <p className="text-red-500 text-sm" data-testid="nickname-validation-error">
                        닉네임은 2자 이상이어야 합니다
                      </p>
                    )}
                    {tempNickname.length > 20 && (
                      <p className="text-red-500 text-sm" data-testid="nickname-validation-error">
                        닉네임은 20자 이하여야 합니다
                      </p>
                    )}
                    {tempNickname.length >= 2 && tempNickname.length <= 20 && !/^[가-힣a-zA-Z0-9\s]+$/.test(tempNickname) && (
                      <p className="text-red-500 text-sm" data-testid="nickname-validation-error">
                        한글, 영문, 숫자만 사용할 수 있습니다
                      </p>
                    )}
                  </>
                )}
                
                <p className="text-gray-600">{userInfo?.email || '이메일 없음'}</p>
                <p className="text-sm text-blue-600">{userInfo?.role || 'USER'}</p>
              </div>
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
                disabled={blockLoading}
              >
                <UserX className="w-5 h-5 mr-3 text-gray-500" />
                차단한 사용자 {blockLoading && "(로딩중...)"}
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

          {/* 다크모드 토글 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getThemeIcon()}
                  <span className="ml-3">
                    테마: {theme === 'light' ? '라이트' : theme === 'dark' ? '다크' : '시스템'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleThemeToggle}
                    data-testid="dark-mode-toggle"
                    className="flex items-center gap-2"
                  >
                    {getThemeIcon()}
                    변경
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme('system')}
                    data-testid="system-theme-option"
                    className="text-xs"
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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
