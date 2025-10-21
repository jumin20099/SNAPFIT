'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, Tag, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CodyProductList } from '@/components/ui/CodyProductList'
import { PlacedItem } from '@/entities/cody/model'

interface CodyData {
  items: PlacedItem[]
  background: {
    type: 'color' | 'image'
    selectedBackground: string
    customColor: string
  }
  timestamp: number
  name?: string
}

export default function CreatePostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editPostId = searchParams.get('edit')
  const isEditMode = Boolean(editPostId)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [codyData, setCodyData] = useState<CodyData | null>(null)
  const [codyImage, setCodyImage] = useState<string | null>(null)
  const [isLoadingPost, setIsLoadingPost] = useState(false)
  const [anonymousPassword, setAnonymousPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [requiresAnonymousPassword, setRequiresAnonymousPassword] = useState(false)
  const needsPasswordForSubmit = !isLoggedIn || requiresAnonymousPassword

  // localStorage에서 코디 데이터 로드 또는 URL state에서 로드
  useEffect(() => {
    const loadExportData = () => {
      try {
        // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
        // 서버에서 자동으로 인증 처리
        setIsLoggedIn(true)
        
        // URL state에서 코디 데이터 확인 (마이페이지에서 공유한 경우)
        const urlParams = new URLSearchParams(window.location.search)
        const codyDataParam = urlParams.get('codyData')
        if (codyDataParam) {
          try {
            const codyData = JSON.parse(decodeURIComponent(codyDataParam))
            setCodyData(codyData)
            if (codyData.name) {
              setTitle(codyData.name)
            }
            setContent(`"${codyData.name || '코디'}" 코디를 공유합니다! 💫\n\n아이템 ${codyData.items.length}개로 구성된 오늘의 코디입니다.`)
            setTags(['코디', '패션', '스타일'])
            return
          } catch (error) {
            console.error('URL state 코디 데이터 파싱 실패:', error)
          }
        }
        
        // localStorage에서 코디 데이터 로드 (코디 페이지에서 export한 경우)
        // 보안상 문제가 되지 않지만 일관성을 위해 제거
        // const exportDataStr = localStorage.getItem('cody-export-data')
        // 코디 데이터는 URL state나 다른 방법으로 전달받아야 함
        
        // 임시로 빈 객체 사용 (실제로는 URL state나 다른 방법 필요)
        const exportData: { codyData: any | null, codyImage: string | null } = { codyData: null, codyImage: null }
        
        if (exportData.codyData) {
          setCodyData(exportData.codyData)
          // 코디 이름을 제목으로 설정
          if (exportData.codyData.name) {
            setTitle(exportData.codyData.name)
          }
          // 기본 내용 설정
          setContent(`"${exportData.codyData.name || '코디'}" 코디를 공유합니다! 💫\n\n아이템 ${exportData.codyData.items.length}개로 구성된 오늘의 코디입니다.`)
          // 기본 태그 설정
          setTags(['코디', '패션', exportData.codyData.name || '코디'])
        }
        
        if (exportData.codyImage) {
          setCodyImage(exportData.codyImage)
          // 코디 이미지를 images 배열에 추가
          setImages([exportData.codyImage])
        }
        
        // 데이터 사용 후 정리 (localStorage 사용하지 않음)
        // localStorage.removeItem('cody-export-data')
      } catch (error) {
        console.error('코디 데이터 로드 실패:', error)
        // localStorage.removeItem('cody-export-data')
      }
    }
    
    loadExportData()
  }, [])

  // 수정 모드일 경우 기존 게시글 데이터 불러오기
  useEffect(() => {
    const loadPostDetail = async () => {
      if (!isEditMode || !editPostId) return

      try {
        setIsLoadingPost(true)
        // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
        // 서버에서 자동으로 인증 처리
        setIsLoggedIn(true)
        const response = await fetch(`/api/posts/${editPostId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('게시글 정보를 불러오지 못했습니다.')
        }

        const data = await response.json()
        setTitle(data.title || '')
        setContent(data.content || '')
        setTags(Array.isArray(data.tags) ? data.tags : [])
        setImages(Array.isArray(data.mediaUrls) ? data.mediaUrls : [])
        setRequiresAnonymousPassword(data.authorId === 'anonymous')
        setAnonymousPassword('')

        if (data.codyData) {
          setCodyData(data.codyData)
        }

        if (Array.isArray(data.mediaUrls) && data.mediaUrls.length > 0) {
          setCodyImage(data.mediaUrls[0])
        }
      } catch (error) {
        console.error('게시글 불러오기 실패:', error)
        alert(error instanceof Error ? error.message : '게시글 정보를 불러오지 못했습니다.')
      } finally {
        setIsLoadingPost(false)
      }
    }

    loadPostDetail()
  }, [isEditMode, editPostId])

  // 태그 추가
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // 태그 제거
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // 이미지 업로드
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      
      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.')
        return
      }
      
      // 이미지 개수 제한 (최대 5개)
      if (images.length >= 5) {
        alert('최대 5개의 이미지만 업로드 가능합니다.')
        return
      }
      
      // FileReader로 이미지를 Base64로 변환
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages([...images, e.target.result as string])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // 이미지 제거
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // 게시글 제출
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const needsPassword = !isLoggedIn || requiresAnonymousPassword
      let trimmedPassword: string | undefined

      if (needsPassword) {
        trimmedPassword = anonymousPassword.trim()
        if (trimmedPassword.length < 4) {
          alert('비밀번호는 4자 이상 입력해주세요.')
          setIsSubmitting(false)
          return
        }
      }

      const postData: Record<string, any> = {
        title: title.trim(),
        content: content.trim(),
        tags,
        mediaUrls: images,
        codyData: codyData ? {
          name: codyData.name,
          items: codyData.items,
          background: codyData.background,
          timestamp: codyData.timestamp
        } : undefined
      }

      // 코디 페이지에서 저장 직후 export한 경우, outfitId는 다른 방법으로 전달받아야 함
      // const maybeOutfitId = localStorage.getItem('cody-last-outfit-id')
      // if (maybeOutfitId) {
      //   postData.outfitId = Number(maybeOutfitId)
      // }

      if (needsPassword && trimmedPassword) {
        postData.anonymousPassword = trimmedPassword
      }

      // 실제 API 호출
      console.log('게시글 작성 요청 데이터:', postData)
      
      const endpoint = isEditMode && editPostId ? `/api/posts/${editPostId}` : '/api/posts'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      })

      console.log('API 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API 에러 응답:', errorData)
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // export 경로에서 outfitId를 사용했다면 중복 저장 방지 위해 플래그 제거
      // localStorage 사용하지 않음 (보안상 일관성 유지)
      // if (maybeOutfitId) {
      //   localStorage.removeItem('cody-last-outfit-id')
      // }
      console.log('게시글 작성 성공:', result)
      
      alert(isEditMode ? '게시글이 성공적으로 수정되었습니다.' : '게시글이 성공적으로 작성되었습니다! 🎉')
      if (isEditMode && editPostId) {
        router.push(`/community/${editPostId}`)
      } else {
        router.push('/community')
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error)
      alert(`게시글 작성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {isEditMode && isLoadingPost ? (
        <div className="flex h-full items-center justify-center">
          <span className="text-gray-500">게시글 정보를 불러오는 중...</span>
        </div>
      ) : (
        <>
      {/* 헤더 */}
      <div className="bg-white dark:bg-dark-sub border-b border-gray-200 dark:border-dark-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 px-3"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>뒤로가기</span>
              </Button>
              <h1 className="text-lg font-semibold">{isEditMode ? '글 수정' : '글 작성'}</h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingPost || !title.trim() || !content.trim() || (needsPasswordForSubmit && anonymousPassword.trim().length < 4)}
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? '처리 중...' : isEditMode ? '수정 완료' : '게시'}
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {needsPasswordForSubmit && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-light-text dark:text-gray-300 mb-2">
              게시글 비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={anonymousPassword}
              onChange={(e) => setAnonymousPassword(e.target.value)}
              placeholder="4자 이상 입력하세요"
            />
            <p className="text-xs text-gray-500 mt-1">
              익명으로 작성한 게시글은 비밀번호가 있어야 수정과 삭제가 가능합니다.
            </p>
          </div>
        )}

        {/* 코디에 사용된 상품 정보 */}
        {codyData && codyData.items.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">사용된 상품</h3>
            <CodyProductList
              items={codyData.items}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
              showScrollButtons={true}
            />
          </div>
        )}

        {/* 코디 이미지 */}
        {codyImage && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">코디 이미지</h3>
            <div className="relative">
              <img
                src={codyImage}
                alt="코디 이미지"
                className="w-full max-w-sm mx-auto rounded-lg"
              />
            </div>
          </div>
        )}

        {/* 제목 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            제목
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full"
            maxLength={100}
          />
          <div className="text-xs text-gray-500 mt-1">
            {title.length}/100
          </div>
        </div>

        {/* 내용 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            내용
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            className="w-full min-h-[200px]"
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 mt-1">
            {content.length}/1000
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            이미지
          </label>
          <div className="space-y-3">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`업로드된 이미지 ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={images.length >= 5}
              />
              <div className="w-full h-32 border-dashed border-2 border-gray-300 hover:border-gray-400 rounded-lg cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {images.length >= 5 ? '최대 5개까지 업로드 가능' : '이미지 추가'}
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 태그 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            태그
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="태그를 입력하세요"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
              size="sm"
            >
              <Tag className="w-4 h-4 mr-1" />
              추가
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}
