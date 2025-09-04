'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bookmark, 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  MoreHorizontal 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

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

export default function ScrapsPage() {
  const router = useRouter()
  const [scrapPosts, setScrapPosts] = useState<ScrapPost[]>([])
  const [loading, setLoading] = useState(true)

  // 스크랩한 게시글 가져오기
  const fetchScrapPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setScrapPosts([])
        return
      }

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
    } finally {
      setLoading(false)
    }
  }

  // 스크랩 토글
  const toggleScrap = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/scraps/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      })

      if (response.ok) {
        setScrapPosts(prev => prev.filter(post => post.postId !== postId))
      }
    } catch (error) {
      console.error('스크랩 토글 실패:', error)
    }
  }

  useEffect(() => {
    fetchScrapPosts()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

    if (diffHours < 1) return "방금 전"
    if (diffHours === 1) return "1시간 전"
    if (diffHours < 24) return `${diffHours}시간 전`
    return `${Math.ceil(diffHours / 24)}일 전`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">스크랩한 게시글</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {scrapPosts.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">스크랩한 게시글이 없습니다</h3>
            <p className="text-gray-500 dark:text-gray-400">마음에 드는 게시글을 스크랩해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scrapPosts.map((post) => (
              <div
                key={post.postId}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/community/${post.postId}`)}
              >
                {/* 작성자 정보 */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.authorProfileImage} />
                    <AvatarFallback>{post.authorName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{post.authorName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleScrap(post.postId)
                    }}
                    className="p-1 h-8 w-8"
                  >
                    <Bookmark className="w-5 h-5 fill-blue-500 text-blue-500" />
                  </Button>
                </div>

                {/* 게시글 내용 */}
                <div className="mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{post.content}</p>
                </div>

                {/* 이미지 */}
                {post.mediaUrls.length > 0 && (
                  <div className="mb-3">
                    <img 
                      src={post.mediaUrls[0]} 
                      alt="게시글 이미지"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* 태그 */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" />
                    <span>{post.scrapCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
