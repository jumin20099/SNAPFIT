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
import { PostTableList } from '@/components/community/PostTableList'
import { useBatchReactionStatus } from '@/shared/hooks/useBatchReactionStatus'

interface QuestionDetailProps {}

export default function QuestionDetailPage({}: QuestionDetailProps) {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommending, setRecommending] = useState(false)
  const [unrecommending, setUnrecommending] = useState(false)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [isRecommended, setIsRecommended] = useState(false)
  const [isUnrecommended, setIsUnrecommended] = useState(false)

  // 배치 상태 조회를 통해 추천/비추천 상태 확인
  const postId = post?.postId || Number(params.id)
  console.log('postId 상태:', { postId, hasPost: !!post, postData: post, paramsId: params.id })
  
  const { data: batchReactionStatus } = useBatchReactionStatus({
    postIds: postId ? [postId] : [],
    enabled: !!postId
  })

  // 배치 상태가 로드되면 추천/비추천 상태 및 개수 동기화
  useEffect(() => {
    console.log('useEffect 실행:', { 
      batchReactionStatus, 
      postId, 
      hasBatchData: !!batchReactionStatus,
      hasPostId: !!postId 
    })
    
    if (batchReactionStatus && postId) {
      console.log('배치 반응 상태 로드:', { batchReactionStatus, postId })
      const status = batchReactionStatus[`post_${postId}`]
      console.log('게시글 상태:', status)
      if (status) {
        console.log('추천/비추천 상태 업데이트:', {
          recommended: status.recommended,
          unrecommended: status.unrecommended,
          recommendCount: status.recommendCount,
          unrecommendCount: status.unrecommendCount
        })
        setIsRecommended(status.recommended || false)
        setIsUnrecommended(status.unrecommended || false)
        // 게시글 개수도 업데이트
        setPost(prev => prev ? {
          ...prev,
          recommendCount: status.recommendCount || prev.recommendCount,
          unrecommendCount: status.unrecommendCount || prev.unrecommendCount
        } : null)
      } else {
        console.log('게시글 상태를 찾을 수 없음:', `post_${postId}`)
      }
    } else {
      console.log('조건 불만족:', { 
        batchReactionStatus: !!batchReactionStatus, 
        postId: !!postId 
      })
    }
  }, [batchReactionStatus, postId])

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

  // 추천 처리 (비추천과 독립적으로 작동)
  const handleRecommend = async () => {
    if (!post) return
    
    // 이미 추천한 경우 추천 취소
    if (isRecommended) {
      setRecommending(true)
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
        const response = await fetch(`${API_BASE_URL}/api/posts/${post.postId}/recommend`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setPost(prev => prev ? { ...prev, recommendCount: data.recommendCount } : null)
          setIsRecommended(false)
          toast.success('추천이 취소되었습니다.')
        } else {
          const errorData = await response.json().catch(() => ({ error: '추천 취소에 실패했습니다.' }))
          toast.error(errorData.error || '추천 취소에 실패했습니다.')
        }
      } catch (error) {
        console.error('추천 취소 실패:', error)
        toast.error('추천 취소에 실패했습니다.')
      } finally {
        setRecommending(false)
      }
      return
    }
    
    // 추천 진행 (비추천 상태와 무관하게 진행)
    setRecommending(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.postId}/recommend`, {
        method: 'POST',
        credentials: 'include'
      })

        if (response.ok) {
          const data = await response.json()
          setPost(prev => prev ? { 
            ...prev, 
            recommendCount: data.recommendCount,
            unrecommendCount: data.unrecommendCount || prev.unrecommendCount
          } : null)
          setIsRecommended(true)
          toast.success('추천되었습니다.')
        } else {
          const errorData = await response.json().catch(() => ({ error: '추천에 실패했습니다.' }))
          toast.error(errorData.error || '추천에 실패했습니다.')
        }
    } catch (error) {
      console.error('추천 실패:', error)
      toast.error('추천에 실패했습니다.')
    } finally {
      setRecommending(false)
    }
  }

  // 비추천 처리 (추천과 독립적으로 작동, 토글 방식)
  const handleUnrecommend = async () => {
    if (!post) return
    
    setUnrecommending(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      
      // 이미 비추천한 경우 비추천 취소 (DELETE)
      if (isUnrecommended) {
        const response = await fetch(`${API_BASE_URL}/api/posts/${post.postId}/unrecommend`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setPost(prev => prev ? { ...prev, unrecommendCount: data.unrecommendCount } : null)
          setIsUnrecommended(false)
          toast.success('비추천이 취소되었습니다.')
        } else {
          const errorData = await response.json().catch(() => ({ error: '비추천 취소에 실패했습니다.' }))
          toast.error(errorData.error || '비추천 취소에 실패했습니다.')
        }
      } 
      // 비추천 진행 (POST)
      else {
        const response = await fetch(`${API_BASE_URL}/api/posts/${post.postId}/unrecommend`, {
          method: 'POST',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setPost(prev => prev ? { 
            ...prev, 
            unrecommendCount: data.unrecommendCount,
            recommendCount: data.recommendCount || prev.recommendCount
          } : null)
          setIsUnrecommended(true)
          toast.success('비추천되었습니다.')
        } else {
          const errorData = await response.json().catch(() => ({ error: '비추천에 실패했습니다.' }))
          toast.error(errorData.error || '비추천에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('비추천 처리 실패:', error)
      toast.error('비추천 처리에 실패했습니다.')
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

  // 관련 게시글 조회 (같은 게시판의 최신 게시글)
  const fetchRelatedPosts = async () => {
    try {
      setRelatedLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(
        `${API_BASE_URL}/api/posts/board/QUESTION?page=0&size=10`,
        { credentials: 'include' }
      )

      if (response.ok) {
        const data = await response.json()
        // 현재 게시글 제외
        const filtered = data.content.filter((p: Post) => p.postId !== Number(params.id))
        setRelatedPosts(filtered)
      }
    } catch (error) {
      console.error('관련 게시글 조회 실패:', error)
    } finally {
      setRelatedLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchPost()
      fetchRelatedPosts()
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
                  className="flex items-center gap-2 border-blue-500 text-blue-500 hover:border-blue-600 hover:text-blue-600"
                >
                  <ThumbsUp className="w-4 h-4" />
                  추천 {post.recommendCount}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUnrecommend}
                  disabled={unrecommending}
                  className="flex items-center gap-2 border-red-500 text-red-500 hover:border-red-600 hover:text-red-600"
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>댓글 {post.commentCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              댓글 기능은 추후 구현 예정입니다.
            </div>
          </CardContent>
        </Card>

        {/* 같은 게시판의 다른 게시글 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>다른 질문 게시글</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/community/questions')}
              >
                전체 보기
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relatedLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : relatedPosts.length > 0 ? (
              <PostTableList
                posts={relatedPosts.map((post, index) => ({
                  postId: post.postId,
                  title: post.title || post.content,
                  authorName: post.authorName,
                  anonymousIndex: post.anonymousIndex ?? null,
                  createdAt: post.createdAt,
                  viewCount: post.viewCount,
                  recommendCount: post.recommendCount ?? post.likeCount ?? 0,
                  order: index + 1,
                  thumbnailUrl: post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null,
                  categoryLabel: '질문',
                }))}
                onSelect={(postId) => router.push(`/community/questions/${postId}`)}
              />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                다른 게시글이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
