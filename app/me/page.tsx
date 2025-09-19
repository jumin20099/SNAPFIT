
'use client'

import { useState, useEffect, useRef } from 'react'
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
import { MyCodyList } from '@/components/ui/MyCodyList'
import { Badge } from '@/components/ui/badge'
import ProfileImageEditor from '@/components/ProfileImageEditor'
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

interface OrderItem {
  productId: number
  productName: string
  productImage: string
  quantity: number
  price: number
}

interface Order {
  orderId: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  orderItems: OrderItem[]
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export default function MePage() {
  const router = useRouter()
  // const { theme, setTheme } = useTheme()
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [scrapPosts, setScrapPosts] = useState<ScrapPost[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'cody' | 'orders'>('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // 주문 내역 가져오기
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const ordersData = await response.json()
        setOrders(ordersData)
      } else {
        console.error('주문 내역 조회 실패:', response.status)
      }
    } catch (error) {
      console.error('주문 내역 조회 오류:', error)
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

  // 프로필 이미지 파일 선택
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 유효성 검사
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('JPG, PNG, WEBP 형식만 지원됩니다.')
      return
    }

    // 이미지 URL 생성하여 편집기로 전달
    const imageUrl = URL.createObjectURL(file)
    setSelectedImageUrl(imageUrl)
    setShowImageEditor(true)
    setShowImageUpload(false)
  }

  // 편집된 이미지 업로드
  const handleCroppedImageUpload = async (croppedImageUrl: string) => {
    setIsUploading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Blob URL을 File로 변환
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/media/upload/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (uploadResponse.ok) {
        const result = await uploadResponse.json()
        if (result.success) {
          // 1. 로컬 상태 업데이트
          setUser(prev => prev ? { ...prev, profileImage: result.data.url } : null)
          
          // 2. 서버에 프로필 이미지 URL 업데이트
          try {
            const profileUpdateResponse = await fetch('/api/user/profile', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                profileImage: result.data.url
              })
            })

            if (profileUpdateResponse.ok) {
              const profileResult = await profileUpdateResponse.json()
              if (profileResult.success) {
                // 서버에서 최신 사용자 정보로 업데이트
                setUser(prev => prev ? { ...prev, ...profileResult.user } : null)
                alert('프로필 이미지가 성공적으로 업데이트되었습니다.')
              } else {
                throw new Error(profileResult.error || '프로필 업데이트 실패')
              }
            } else {
              const errorData = await profileUpdateResponse.json()
              throw new Error(errorData.error || '프로필 업데이트 실패')
            }
          } catch (profileError) {
            console.error('프로필 업데이트 실패:', profileError)
            // 이미지는 업로드되었지만 프로필 업데이트 실패
            alert('이미지는 업로드되었지만 프로필 업데이트에 실패했습니다. 새로고침 후 다시 시도해주세요.')
          }
        } else {
          throw new Error(result.error || '업로드 실패')
        }
      } else {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || '업로드 실패')
      }
    } catch (error) {
      console.error('프로필 이미지 업로드 실패:', error)
      alert(`프로필 이미지 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsUploading(false)
      setShowImageEditor(false)
      setSelectedImageUrl('')
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 이미지 편집 취소
  const handleImageEditCancel = () => {
    setShowImageEditor(false)
    setSelectedImageUrl('')
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
    fetchOrders()
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
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="w-4 h-4 text-black" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute opacity-0 w-0 h-0 overflow-hidden"
                onChange={handleImageSelect}
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

        {/* 탭 네비게이션 */}
        <div className="bg-white dark:bg-dark-sub rounded-lg shadow-sm">
          <div className="flex border-b border-gray-200 dark:border-dark-border">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
                activeTab === 'profile'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              프로필
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
                activeTab === 'cody'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('cody')}
            >
              내 코디
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
                activeTab === 'orders'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              주문 내역
            </button>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'profile' ? (
          <>
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
          </>
        ) : activeTab === 'cody' ? (
          /* 내 코디 탭 */
          <div className="bg-white dark:bg-dark-sub rounded-lg p-6 shadow-sm">
            <MyCodyList />
          </div>
        ) : (
          /* 주문 내역 탭 */
          <div className="bg-white dark:bg-dark-sub rounded-lg p-6 shadow-sm">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">주문 내역이 없습니다</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">아직 주문한 상품이 없습니다.</p>
                <Button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  쇼핑하러 가기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.orderId} className="border border-gray-200 dark:border-dark-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">주문번호: {order.orderNumber}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'PENDING' ? '결제 대기' :
                         order.status === 'PAID' ? '결제 완료' :
                         order.status === 'SHIPPED' ? '배송 중' :
                         order.status === 'DELIVERED' ? '배송 완료' :
                         order.status === 'CANCELLED' ? '주문 취소' :
                         order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {order.orderItems?.map((item, index) => (
                        <div key={index} className="flex items-center py-3 border-b border-gray-100 dark:border-dark-border last:border-b-0">
                          <div className="flex-shrink-0 w-16 h-16 mr-3">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-dark-border"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-product.svg'
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.productName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">수량: {item.quantity}개</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {(item.price * item.quantity).toLocaleString()}원
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-dark-border">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        총 {order.orderItems?.length || 0}개 상품
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        총 {order.totalAmount.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

      {/* 프로필 이미지 편집기 */}
      {showImageEditor && selectedImageUrl && (
        <ProfileImageEditor
          imageUrl={selectedImageUrl}
          onCropComplete={handleCroppedImageUpload}
          onCancel={handleImageEditCancel}
        />
      )}

      {/* 업로드 중 로딩 */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">프로필 이미지를 업로드하는 중...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
