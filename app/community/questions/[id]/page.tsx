"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ThumbsUp, ThumbsDown, Eye, MessageCircle, Calendar, ArrowLeft, Share2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { Post } from '@/shared/types'

interface QuestionDetailProps {}

export default function QuestionDetailPage({}: QuestionDetailProps) {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommending, setRecommending] = useState(false)
  const [unrecommending, setUnrecommending] = useState(false)

  // 게시글 조회
  const fetchPost = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${params.id}`,
        { credentials: 'include' }
      )

      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else if (response.status === 404) {
        toast.error('게시글을 찾을 수 없습니다.')
        router.push('/community/questions')
      } else {
        toast.error('게시글을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error)
      toast.error('게시글을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 추천 처리
  const handleRecommend = async () => {
    if (!post) return
    
    setRecommending(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.postId}/recommend`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setPost(prev => prev ? { ...prev, recommendCount: data.recommendCount } : null)
        toast.success('추천되었습니다.')
      } else {
        toast.error('추천에 실패했습니다.')
      }
    } catch (error) {
      console.error('추천 실패:', error)
      toast.error('추천에 실패했습니다.')
    } finally {
      setRecommending(false)
    }
  }

  // 비추천 처리
  const handleUnrecommend = async () => {
    if (!post) return
    
    setUnrecommending(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.postId}/unrecommend`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setPost(prev => prev ? { ...prev, unrecommendCount: data.unrecommendCount } : null)
        toast.success('비추천되었습니다.')
      } else {
        toast.error('비추천에 실패했습니다.')
      }
    } catch (error) {
      console.error('비추천 실패:', error)
      toast.error('비추천에 실패했습니다.')
    } finally {
      setUnrecommending(false)
    }
  }

  // 공유하기
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || '질문',
          text: post?.content,
          url: window.location.href
        })
      } catch (error) {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      // 클립보드에 URL 복사
      await navigator.clipboard.writeText(window.location.href)
      toast.success('링크가 복사되었습니다.')
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return '-'
    }

    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')
    const seconds = `${date.getSeconds()}`.padStart(2, '0')

    return `${year}:${month}:${day}:${hours}:${minutes}:${seconds}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <div className="mx-auto max-w-4xl p-4">
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <div className="mx-auto max-w-4xl p-4">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              게시글을 찾을 수 없습니다
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              요청하신 게시글이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => router.push('/community/questions')}>
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pb-20">
      <div className="mx-auto max-w-4xl p-4">
        {/* 헤더 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {post.title || '제목 없음'}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {post.anonymousIndex ? `익명${post.anonymousIndex}` : (post.author?.nickname || '알 수 없음')}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.viewCount}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                공유
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 게시글 내용 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                {post.content}
              </div>
            </div>

            {/* 이미지 갤러리 */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">첨부 이미지</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.mediaUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url}
                        alt={`첨부 이미지 ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          // 이미지 확대 모달 구현 예정
                          window.open(url, '_blank')
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleRecommend}
                  disabled={recommending}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  추천 {post.recommendCount}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUnrecommend}
                  disabled={unrecommending}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  비추천 {post.unrecommendCount}
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  댓글 {post.commentCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>댓글 {post.commentCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              댓글 기능은 추후 구현 예정입니다.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
