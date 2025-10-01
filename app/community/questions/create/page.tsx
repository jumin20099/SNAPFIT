"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CreateQuestionProps {}

export default function CreateQuestionPage({}: CreateQuestionProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [anonymousPassword, setAnonymousPassword] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    setIsLoggedIn(!!token)
  }, [])

  // 이미지 업로드
  const handleImageUpload = async (files: FileList) => {
    if (images.length + files.length > 30) {
      toast.error('이미지는 최대 30장까지 업로드할 수 있습니다.')
      return
    }

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'post')

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
        const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          console.log('업로드 응답:', data)
          return data.url
        } else {
          const errorData = await response.json()
          console.error('업로드 실패:', errorData)
          throw new Error(errorData.message || '업로드 실패')
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      console.log('업로드된 이미지 URLs:', uploadedUrls)
      setImages(prev => [...prev, ...uploadedUrls])
      toast.success(`${uploadedUrls.length}개 이미지가 업로드되었습니다.`)
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      toast.error('이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  // 이미지 제거
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // 게시글 작성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('제목을 입력해주세요.')
      return
    }
    
    if (!content.trim()) {
      toast.error('내용을 입력해주세요.')
      return
    }

    const trimmedPassword = anonymousPassword.trim()

    if (!isLoggedIn && trimmedPassword.length < 4) {
      toast.error('비회원은 4자 이상 비밀번호를 입력해야 합니다.')
      return
    }

    setSubmitting(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
          mediaUrls: images,
          boardType: 'QUESTION',
          isAnonymous: !isLoggedIn,
          anonymousPassword: !isLoggedIn ? trimmedPassword : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('질문이 작성되었습니다.')
        router.push(`/community/questions/${data.postId}`)
      } else {
        const error = await response.json()
        toast.error(error.message || '게시글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error)
      toast.error('게시글 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pb-20">
      <div className="mx-auto max-w-4xl p-4">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">❓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">질문 작성</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-11">
            궁금한 점을 질문하고 답변을 받아보세요. 명확한 제목과 구체적인 내용을 작성해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>질문 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 제목 */}
              <div>
                <Label htmlFor="title">제목 <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="질문의 제목을 입력하세요 (필수)"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {title.length}/100자
                </p>
              </div>

              {/* 내용 */}
              <div>
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="질문 내용을 자세히 작성해주세요"
                  rows={10}
                  maxLength={10000}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {content.length}/10,000자
                </p>
              </div>
            </CardContent>
          </Card>

          {!isLoggedIn && (
            <Card>
              <CardHeader>
                <CardTitle>익명 비밀번호</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label htmlFor="anonymousPassword">비밀번호 (최소 4자)</Label>
                  <Input
                    id="anonymousPassword"
                    type="password"
                    value={anonymousPassword}
                    onChange={(e) => setAnonymousPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    minLength={4}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    비회원은 익명 비밀번호를 통해 작성 글을 수정/삭제할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 이미지 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                이미지 첨부
                <Badge variant="secondary">최대 30장</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 업로드 영역 */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  disabled={uploading || images.length >= 30}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${uploading || images.length >= 30 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {uploading ? '업로드 중...' : '이미지를 선택하거나 드래그하세요'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {images.length}/30장
                  </p>
                </label>
              </div>

              {/* 업로드된 이미지 목록 */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`업로드된 이미지 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                        onError={(e) => {
                          console.error('이미지 로드 실패:', url)
                          e.currentTarget.src = '/placeholder-image.png'
                          e.currentTarget.alt = '이미지 로드 실패'
                        }}
                        onLoad={() => {
                          console.log('이미지 로드 성공:', url)
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 작성 가이드 */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">작성 가이드</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• 구체적이고 명확한 질문을 작성해주세요</li>
                    <li>• 관련 이미지나 스크린샷을 첨부하면 더 좋은 답변을 받을 수 있습니다</li>
                    <li>• 다른 사용자에게 도움이 되는 질문을 작성해주세요</li>
                    <li>• 욕설이나 비방은 금지됩니다</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                !content.trim() ||
                submitting ||
                (!isLoggedIn && anonymousPassword.trim().length < 4)
              }
            >
              {submitting ? '작성 중...' : '질문 작성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
