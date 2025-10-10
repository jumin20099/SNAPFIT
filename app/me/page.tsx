
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  LogOut,
  Flag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MyCodyList } from '@/components/ui/MyCodyList'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ProfileImageEditor from '@/components/ProfileImageEditor'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Report, useReport } from '@/hooks/useReport'
import { REPORT_CATEGORIES, REPORT_STATUS_LABELS } from '@/features/report/constants'
import { ReportButton } from '@/features/report/ReportButton'
import { toast } from 'sonner'
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
  const searchParams = useSearchParams()
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
  const [activeTab, setActiveTab] = useState<'profile' | 'cody' | 'orders' | 'reports'>('profile')

  // URL 파라미터에서 탭 상태 읽기
  useEffect(() => {
    const tab = searchParams.get('tab') as 'profile' | 'cody' | 'orders' | 'reports'
    if (tab && ['profile', 'cody', 'orders', 'reports'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (tab: 'profile' | 'cody' | 'orders' | 'reports') => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    router.replace(url.pathname + url.search, { scroll: false })
  }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [measurements, setMeasurements] = useState<{ heightCm?: number | null; weightKg?: number | string | null; isPublic?: boolean } | null>(null)
  const [measurementLoading, setMeasurementLoading] = useState(false)
  const [measurementError, setMeasurementError] = useState<string | null>(null)
  const [heightInput, setHeightInput] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [isMeasurementPublic, setIsMeasurementPublic] = useState(false)
  const [measurementSaving, setMeasurementSaving] = useState(false)
  
  // 신고 관련 상태
  const [reports, setReports] = useState<Report[]>([])
  const [isReportsLoading, setIsReportsLoading] = useState(false)
  const [reportsPage, setReportsPage] = useState(0)
  const [hasMoreReports, setHasMoreReports] = useState(true)
  const { getMyReports } = useReport()

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

  const formatWeightForInput = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') return ''
    const numeric = typeof value === 'string' ? parseFloat(value) : value
    if (!Number.isFinite(numeric)) return ''
    return Number.isInteger(numeric) ? numeric.toString() : numeric.toFixed(1).replace(/\.0$/, '')
  }

  const buildMeasurementSummary = () => {
    if (!measurements) return '등록된 신체 정보가 없습니다.'

    const parts: string[] = []
    if (typeof measurements.heightCm === 'number' && Number.isFinite(measurements.heightCm)) {
      parts.push(`키 ${measurements.heightCm}cm`)
    }
    const weightLabel = formatWeightForInput(measurements.weightKg)
    if (weightLabel) {
      parts.push(`몸무게 ${weightLabel}kg`)
    }

    const visibility = measurements.isPublic ? '공개' : '비공개'
    if (parts.length === 0) {
      return `기본 신체 정보가 입력되어 있지 않습니다. (현재 설정: ${visibility})`
    }

    return `${parts.join(' · ')} (현재 설정: ${visibility})`
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

  const fetchMeasurements = async (userId: string) => {
    try {
      setMeasurementLoading(true)
      setMeasurementError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        setMeasurements(null)
        return
      }

      const response = await fetch(`/api/users/${userId}/measurements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 404) {
        setMeasurements(null)
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '신체 정보를 불러오지 못했습니다.')
      }

      const data = await response.json()
      setMeasurements(data)
    } catch (error) {
      console.error('신체 정보 조회 실패:', error)
      setMeasurements(null)
      setMeasurementError('신체 정보를 불러오지 못했습니다.')
    } finally {
      setMeasurementLoading(false)
    }
  }

  const handleSaveMeasurements = async () => {
    if (!user?.id) {
      alert('로그인이 필요합니다.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    const payload: Record<string, unknown> = {
      isPublic: isMeasurementPublic,
    }

    if (heightInput.trim()) {
      const heightValue = parseInt(heightInput, 10)
      if (Number.isNaN(heightValue) || heightValue <= 0) {
        alert('키는 0보다 큰 숫자로 입력해주세요.')
        return
      }
      payload.heightCm = heightValue
    }

    if (weightInput.trim()) {
      const weightValue = parseFloat(weightInput)
      if (Number.isNaN(weightValue) || weightValue <= 0) {
        alert('몸무게는 0보다 큰 숫자로 입력해주세요.')
        return
      }
      payload.weightKg = parseFloat(weightValue.toFixed(1))
    }

    setMeasurementSaving(true)
    setMeasurementError(null)

    try {
      const response = await fetch(`/api/users/${user.id}/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '신체 정보 저장에 실패했습니다.')
      }

      const data = await response.json()
      setMeasurements(data)
      alert('신체 정보가 저장되었습니다.')
    } catch (error) {
      console.error('신체 정보 저장 실패:', error)
      const message = error instanceof Error ? error.message : '신체 정보 저장에 실패했습니다.'
      setMeasurementError(message)
      alert(message)
    } finally {
      setMeasurementSaving(false)
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

  // 신고 내역 가져오기
  const loadReports = async (page: number = 0, append: boolean = false) => {
    try {
      setIsReportsLoading(true)
      const items = await getMyReports(page, 20) // 페이지당 20개로 제한
      
      if (append) {
        setReports(prev => [...prev, ...items])
      } else {
        setReports(items)
      }
      
      setHasMoreReports(items.length === 20) // 20개 미만이면 더 이상 없음
    } catch (error) {
      toast.error('신고 내역을 불러오지 못했습니다')
    } finally {
      setIsReportsLoading(false)
    }
  }

  // 더 많은 신고 내역 로드
  const loadMoreReports = () => {
    if (!isReportsLoading && hasMoreReports) {
      const nextPage = reportsPage + 1
      setReportsPage(nextPage)
      loadReports(nextPage, true)
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

  useEffect(() => {
    if (user?.id) {
      fetchMeasurements(user.id)
    }
  }, [user?.id])

  useEffect(() => {
    if (measurements) {
      setHeightInput(
        typeof measurements.heightCm === 'number' && Number.isFinite(measurements.heightCm)
          ? measurements.heightCm.toString()
          : ''
      )
      setWeightInput(formatWeightForInput(measurements.weightKg))
      setIsMeasurementPublic(Boolean(measurements.isPublic))
    } else {
      setHeightInput('')
      setWeightInput('')
      setIsMeasurementPublic(false)
    }
  }, [measurements])

  // 신고 내역 탭이 활성화될 때 신고 내역 로드
  useEffect(() => {
    if (activeTab === 'reports') {
      // 탭이 변경될 때마다 상태 초기화
      setReportsPage(0)
      setReports([])
      setHasMoreReports(true)
      
      // 신고 내역 로드
      if (!isReportsLoading) {
        loadReports(0, false)
      }
    }
  }, [activeTab])

  // 신고 내역 정렬
  const orderedReports = useMemo(() => {
    return [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reports])

  // 신고 카테고리 라벨 맵
  const categoryLabelMap = REPORT_CATEGORIES.reduce<Record<string, string>>((acc, category) => {
    acc[category.value] = category.label
    return acc
  }, {})

  // 신고 대상 타입 한국어 맵
  const targetTypeLabels = {
    POST: '게시글',
    COMMENT: '댓글',
    USER: '사용자'
  }

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
              className={`flex-1 py-3 px-2 text-sm font-medium text-center ${
                activeTab === 'profile'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => handleTabChange('profile')}
            >
              프로필
            </button>
            <button
              className={`flex-1 py-3 px-2 text-sm font-medium text-center ${
                activeTab === 'cody'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => handleTabChange('cody')}
            >
              내 코디
            </button>
            <button
              className={`flex-1 py-3 px-2 text-sm font-medium text-center ${
                activeTab === 'orders'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => handleTabChange('orders')}
            >
              주문 내역
            </button>
            <button
              className={`flex-1 py-3 px-2 text-sm font-medium text-center ${
                activeTab === 'reports'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => handleTabChange('reports')}
            >
              신고 내역
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

        <div className="bg-white dark:bg-dark-sub rounded-lg p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">신체 정보</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              키와 몸무게를 입력하면 커뮤니티 게시글과 상품 리뷰에서 내 신체 스펙이 함께 표시됩니다.
            </p>
          </div>

          {measurementError && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3">
              {measurementError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-height">키 (cm)</Label>
              <Input
                id="user-height"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="예: 172"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-weight">몸무게 (kg)</Label>
              <Input
                id="user-weight"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                placeholder="예: 65.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="measurement-public"
                checked={isMeasurementPublic}
                onCheckedChange={(checked) => setIsMeasurementPublic(checked)}
              />
              <Label htmlFor="measurement-public" className="text-sm text-gray-600 dark:text-gray-300">
                커뮤니티와 리뷰에 내 신체 스펙을 공개합니다
              </Label>
            </div>
            <Button
              onClick={handleSaveMeasurements}
              disabled={measurementSaving}
              className="w-full sm:w-auto"
            >
              {measurementSaving ? '저장 중...' : '신체 정보 저장'}
            </Button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-dark-border rounded-md p-3 bg-gray-50 dark:bg-dark-border/30">
            {measurementLoading ? '신체 정보를 불러오는 중...' : buildMeasurementSummary()}
          </div>
        </div>
          </>
        ) : activeTab === 'cody' ? (
          /* 내 코디 탭 */
          <div className="bg-white dark:bg-dark-sub rounded-lg p-6 shadow-sm">
            <MyCodyList />
          </div>
        ) : activeTab === 'orders' ? (
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
        ) : activeTab === 'reports' ? (
          /* 신고 내역 탭 */
          <div className="bg-white dark:bg-dark-sub rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">내 신고 내역</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">최근 50개의 신고 내역을 보여드립니다.</p>
            </div>
            
            {isReportsLoading && reports.length === 0 ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : orderedReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Flag className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">신고 내역이 없습니다</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">아직 접수된 신고가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderedReports.map((report) => (
                  <div
                    key={report.reportId}
                    className="rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-sub p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{targetTypeLabels[report.targetType] || report.targetType}</Badge>
                        <Badge variant="outline">{categoryLabelMap[report.category] || report.category}</Badge>
                      </div>
                      <Badge variant="outline">
                        {REPORT_STATUS_LABELS[report.status] || report.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      {report.reason || '사유 없음'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      접수일: {new Date(report.createdAt).toLocaleString('ko-KR')}
                    </div>
                    <div className="mt-2">
                      <ReportButton
                        targetType={report.targetType}
                        targetId={report.targetType === 'USER' ? undefined : report.targetId}
                        targetUserId={report.targetUserId}
                        variant="ghost"
                        size="sm"
                        label="다시 신고"
                      />
                    </div>
                  </div>
                ))}
                
                {/* 더 보기 버튼 */}
                {hasMoreReports && (
                  <div className="text-center mt-4">
                    <Button
                      onClick={loadMoreReports}
                      disabled={isReportsLoading}
                      variant="outline"
                      size="sm"
                    >
                      {isReportsLoading ? '로딩 중...' : '더 보기'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
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
