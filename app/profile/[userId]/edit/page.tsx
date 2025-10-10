'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import ProfileImageEditor from '@/components/ProfileImageEditor'

interface ProfileData {
  userId: string
  nickname: string
  profileImage: string
  bio: string
}

export default function ProfileEditPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  
  const [profile, setProfile] = useState<ProfileData>({
    userId: '',
    nickname: '',
    profileImage: '',
    bio: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${userId}`, {
        credentials: 'include' // HttpOnly 쿠키 자동 전송
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile({
          userId: data.userId,
          nickname: data.nickname || '',
          profileImage: data.profileImage || '',
          bio: data.bio || ''
        })
      } else {
        console.error('프로필 조회 실패')
      }
    } catch (error) {
      console.error('프로필 조회 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const response = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // HttpOnly 쿠키 자동 전송
        body: JSON.stringify({
          nickname: profile.nickname,
          profileImage: profile.profileImage,
          bio: profile.bio
        })
      })

      if (response.ok) {
        router.push(`/profile/${userId}`)
      } else {
        const error = await response.json()
        alert(error.message || '프로필 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('프로필 수정 중 오류:', error)
      alert('프로필 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
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
  }

  // 편집된 이미지 업로드
  const handleCroppedImageUpload = async (croppedImageUrl: string) => {
    setIsUploading(true)
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리

      // Blob URL을 File로 변환
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/media/upload/profile', {
        credentials: 'include', // HttpOnly 쿠키 자동 전송
        method: 'POST',
        body: formData
      })

      if (uploadResponse.ok) {
        const result = await uploadResponse.json()
        if (result.success) {
          // 1. 로컬 상태 업데이트
          setProfile(prev => ({ ...prev, profileImage: result.data.url }))
          
          // 2. 서버에 프로필 이미지 URL 업데이트
          try {
            const profileUpdateResponse = await fetch('/api/profiles/me', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                profileImage: result.data.url
              })
            })

            if (profileUpdateResponse.ok) {
              alert('프로필 이미지가 성공적으로 업데이트되었습니다.')
            } else {
              const errorData = await profileUpdateResponse.json()
              throw new Error(errorData.error || '프로필 업데이트 실패')
            }
          } catch (profileError) {
            console.error('프로필 업데이트 실패:', profileError)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">프로필 수정</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* 프로필 이미지 */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <Image
                src={profile.profileImage || '/placeholder.svg'}
                alt="프로필 이미지"
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              프로필 이미지를 클릭하여 변경하세요
            </p>
          </div>

          {/* 닉네임 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile(prev => ({ ...prev, nickname: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="닉네임을 입력하세요"
              maxLength={20}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {profile.nickname.length}/20
            </p>
          </div>

          {/* 소개글 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              소개글
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="자신을 소개해보세요"
              rows={4}
              maxLength={150}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {profile.bio.length}/150
            </p>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !profile.nickname.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>

      {/* 이미지 크롭 에디터 */}
      {showImageEditor && selectedImageUrl && (
        <ProfileImageEditor
          imageUrl={selectedImageUrl}
          onCropComplete={handleCroppedImageUpload}
          onCancel={handleImageEditCancel}
        />
      )}
    </div>
  )
}
