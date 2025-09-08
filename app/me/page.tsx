
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Camera, 
  Edit3, 
  Heart, 
  Bookmark, 
  Moon, 
  Sun, 
  Settings,
  ArrowLeft,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
// import { useTheme } from 'next-themes'

interface UserProfile {
  id: string
  nickname: string
  email: string
  profileImage?: string
  createdAt: string
}

interface ScrapPost {
  postId: number
  content: string
  authorName: string
  authorProfileImage: string
  mediaUrls: string[]
  likeCount: number
  commentCount: number
  scrapCount: number
  createdAt: string
  tags: string[]
}

export default function MePage() {
  const router = useRouter()
  // const { theme, setTheme } = useTheme()
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [scrapPosts, setScrapPosts] = useState<ScrapPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [showImageUpload, setShowImageUpload] = useState(false)

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        return
      }

      const response = await fetch('/api/user/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser({
          id: userData.userIdx || userData.id || '',
          nickname: userData.nickname || '사용자',
          email: userData.email || '',
          profileImage: userData.profileImage,
          createdAt: userData.createdAt || new Date().toISOString()
        })
        setEditNickname(userData.nickname || '사용자')
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error)
    }
  }

  // 스크랩한 게시글 가져오기
  const fetchScrapPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/scraps/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const scrapData = await response.json()
        console.log('스크랩 데이터:', scrapData)
        
        // 스크랩한 게시글 상세 정보 가져오기
        if (scrapData.length > 0) {
          const postIds = scrapData.map((item: any) => item.targetIdx)
          
          const postsResponse = await fetch('/api/posts/liked', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ postIds })
          })

          if (postsResponse.ok) {
            const postsData = await postsResponse.json()
            const posts = postsData.map((post: any) => ({
              postId: post.postIdx || post.postId,
              content: post.content || '내용 없음',
              authorName: post.authorName || post.author?.nickname || '익명',
              authorProfileImage: post.authorProfileImage || post.author?.profileImage || '/placeholder.svg',
              mediaUrls: post.mediaUrls || [],
              likeCount: post.likeCount || 0,
              commentCount: post.commentCount || 0,
              scrapCount: post.scrapCount || 0,
              createdAt: post.createdAt || new Date().toISOString(),
              tags: post.tags || []
            }))
            setScrapPosts(posts)
          }
        }
      }
    } catch (error) {
      console.error('스크랩 게시글 로드 실패:', error)
    }
  }

  // 닉네임 변경
  const updateNickname = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('닉네임 변경 요청:', { nickname: editNickname })
      
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nickname: editNickname })
      })
      
      console.log('응답 상태:', response.status)

      if (response.ok) {
        setUser(prev => prev ? { ...prev, nickname: editNickname } : null)
        setShowEditModal(false)
        alert('닉네임이 성공적으로 변경되었습니다.')
      } else {
        const errorData = await response.json()
        console.error('닉네임 변경 실패:', errorData)
        alert(`닉네임 변경 실패: ${errorData.error || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('닉네임 변경 실패:', error)
      alert('닉네임 변경 중 오류가 발생했습니다.')
    }
  }

  // 프로필 이미지 변경
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/media/upload/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setUser(prev => prev ? { ...prev, profileImage: result.imageUrl } : null)
        setShowImageUpload(false)
      }
    } catch (error) {
      console.error('프로필 이미지 업로드 실패:', error)
    }
  }

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  // 테마 토글
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // DOM에 즉시 테마 적용
    const htmlElement = document.documentElement
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }

  useEffect(() => {
    // 로컬스토리지에서 테마 불러오기
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
      // DOM에 테마 적용
      const htmlElement = document.documentElement
      if (savedTheme === 'dark') {
        htmlElement.classList.add('dark')
      } else {
        htmlElement.classList.remove('dark')
      }
    }
    
    fetchUserInfo()
    fetchScrapPosts()
    setLoading(false)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 상태
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Header */}
        <div className="bg-white dark:bg-dark-sub border-b border-gray-200 dark:border-dark-border p-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">마이페이지</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4">
          <div className="bg-white dark:bg-dark-sub rounded-lg p-8 shadow-sm text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              마이페이지를 이용하려면 로그인해주세요.
            </p>
            <Button 
              className="w-full"
              onClick={() => router.push('/login')}
            >
              로그인하기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-dark-sub border-b border-gray-200 dark:border-dark-border p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">마이페이지</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 프로필 섹션 */}
        <div className="bg-white dark:bg-dark-sub rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="text-lg">
                  {user?.nickname?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 left-0 w-8 h-8 rounded-full p-0 bg-blue-500 hover:bg-blue-600 shadow-lg border-2 border-white z-10"
                onClick={() => setShowImageUpload(true)}
              >
                <Camera className="w-4 h-4 text-black" />
              </Button>
              <input
                type="file"
                accept="image/*"
                className="absolute opacity-0 w-0 h-0 overflow-hidden"
                onChange={handleImageUpload}
                ref={(input) => {
                  if (input && showImageUpload) {
                    input.click()
                    setShowImageUpload(false)
                  }
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {user?.nickname}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="p-1 h-6 w-6 flex-shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                가입일: {user?.createdAt ? formatDate(user.createdAt) : '알 수 없음'}
              </p>
            </div>
          </div>
        </div>


        {/* 액션 버튼들 */}
        <div className="bg-white dark:bg-dark-sub rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-start h-12"
              onClick={() => router.push('/like')}
            >
              <Heart className="w-5 h-5" />
              좋아요 목록
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-start h-12"
              onClick={() => router.push('/scraps')}
            >
              <Bookmark className="w-5 h-5" />
              스크랩 목록
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-start h-12"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {theme === 'dark' ? '라이트모드' : '다크모드'}
            </Button>
          </div>
        </div>
      </div>

      {/* 닉네임 편집 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              닉네임 변경
            </h3>
            <input
              type="text"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
              placeholder="새 닉네임을 입력하세요"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditModal(false)}
              >
                취소
              </Button>
              <Button
                className="flex-1"
                onClick={updateNickname}
                disabled={!editNickname.trim()}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
