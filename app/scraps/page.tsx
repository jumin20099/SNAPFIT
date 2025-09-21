'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LikeButton } from '@/features/reactions/LikeButton'
import { ScrapButton } from '@/features/reactions/ScrapButton'
import { useBatchReactionStatus } from '@/shared/hooks/useBatchReactionStatus'

interface ScrapItem {
  postId: number
  authorName: string
  authorProfileImage?: string
  content: string
  mediaUrls: string[]
  viewCount: number
  likeCount: number
  scrapCount: number
  tags: string[]
  createdAt: string
  liked: boolean
  scraped: boolean
}

export default function ScrapsPage() {
  const router = useRouter()
  const [scraps, setScraps] = useState<ScrapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 스크랩한 게시글 ID 추출
  const scrapPostIds = scraps.map(scrap => scrap.postId)
  
  // 배치 상태 조회
  const { data: batchReactionStatus } = useBatchReactionStatus({
    postIds: scrapPostIds,
    enabled: scrapPostIds.length > 0
  })

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
      
      if (token) {
        await fetchScraps(token)
      } else {
        setLoading(false)
      }
    }
    
    checkLoginStatus()
  }, [])

  const fetchScraps = async (token: string) => {
    try {
      // 1. 스크랩한 게시글 상세 정보 가져오기 (새로운 API 사용)
      const scrapsResponse = await fetch('/api/scraps/my/detailed', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!scrapsResponse.ok) {
        console.error('스크랩 목록 조회 실패:', scrapsResponse.status)
        return
      }
      
      const scrapedPosts = await scrapsResponse.json()
      
      if (!scrapedPosts || scrapedPosts.length === 0) {
        setScraps([])
        return
      }
      
      // 2. ScrapResponseDto를 ScrapedPost 형식으로 변환
      const scrapsWithStatus = scrapedPosts.map((scrap: any) => {
        console.log('스크랩 데이터:', {
          postId: scrap.postId,
          viewCount: scrap.postViewCount || 0,
          likeCount: scrap.postLikeCount || 0,
          scrapedAt: scrap.scrapedAt,
          authorName: scrap.postAuthorName,
          content: scrap.postContent
        })
        return {
          postId: scrap.postId,
          content: scrap.postContent,
          authorName: scrap.postAuthorName,
          authorProfileImage: '', // ScrapResponseDto에 없음
          mediaUrls: scrap.postMediaUrls || [], // 이미지 URL 사용
          likeCount: scrap.postLikeCount || 0,
          commentCount: scrap.postCommentCount || 0,
          scrapCount: 1, // 스크랩한 게시글이므로 1
          createdAt: scrap.scrapedAt, // 스크랩한 날짜 사용
          tags: scrap.postTags || [],
          liked: false, // 기본값
          scraped: true, // 스크랩한 게시글이므로 항상 true
          viewCount: scrap.postViewCount || 0
        }
      })
      
      setScraps(scrapsWithStatus)
    } catch (error) {
      console.error('스크랩 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostClick = (postId: number) => {
    router.push(`/community/${postId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-500 mb-6">스크랩한 게시글을 보려면 로그인해주세요</p>
            <Button onClick={() => router.push('/login')}>
              로그인하기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">스크랩한 게시글</h1>
            <p className="text-gray-500 text-sm">총 {scraps.length}개의 게시글</p>
          </div>
        </div>

        {/* 스크랩 목록 */}
        {scraps.length > 0 ? (
          <div className="space-y-4">
            {scraps.map((scrap) => (
              <div
                key={scrap.postId}
                className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePostClick(scrap.postId)}
              >
                <div className="flex gap-4">
                  {/* 게시글 이미지 */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {scrap.mediaUrls && scrap.mediaUrls.length > 0 ? (
                      <img
                        src={scrap.mediaUrls[0]}
                        alt="게시글 이미지"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">이미지 없음</span>
                      </div>
                    )}
                  </div>

                  {/* 게시글 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{scrap.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {scrap.createdAt ? new Date(scrap.createdAt).toLocaleDateString() : '날짜 정보 없음'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                          {scrap.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>조회 {scrap.viewCount || 0}</span>
                          <span>좋아요 {scrap.likeCount || 0}</span>
                        </div>
                        {scrap.tags && scrap.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {scrap.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={`${scrap.postId}-tag-${index}`}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼들 */}
                      <div 
                        className="flex gap-1 ml-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LikeButton
                          targetIdx={scrap.postId}
                          targetType="outfit"
                          initialActive={
                            batchReactionStatus?.[`post_${scrap.postId}`]?.liked ?? 
                            scrap.liked
                          }
                          initialCount={
                            batchReactionStatus?.[`post_${scrap.postId}`]?.likeCount ?? 
                            scrap.likeCount
                          }
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        />
                        <ScrapButton
                          postId={scrap.postId}
                          initialActive={
                            batchReactionStatus?.[`post_${scrap.postId}`]?.scraped ?? 
                            scrap.scraped
                          }
                          initialCount={
                            batchReactionStatus?.[`post_${scrap.postId}`]?.scrapCount ?? 
                            scrap.scrapCount
                          }
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📌</div>
            <h3 className="text-xl font-semibold mb-2">스크랩한 게시글이 없습니다</h3>
            <p className="text-gray-500 mb-6">마음에 드는 게시글을 스크랩해보세요</p>
            <Button onClick={() => router.push('/community')}>
              커뮤니티 둘러보기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
