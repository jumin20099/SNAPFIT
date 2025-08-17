"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, Send, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"

interface Comment {
  id: number
  author: string
  authorImage: string
  content: string
  date: string
  likes: number
  liked?: boolean
}

interface Post {
  postId: number
  title: string
  content: string
  authorName: string
  authorProfileImage: string
  mediaUrls: string[]
  likeCount: number
  commentCount: number
  scrapCount: number
  createdAt: string
  tags: string[]
  liked?: boolean
  scraped?: boolean
  type?: string
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = Number(params.id)
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [isScraped, setIsScraped] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  const [userInteractionsLoaded, setUserInteractionsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const observer = useRef<IntersectionObserver>()

  // 사용자 상호작용 상태 가져오기 (좋아요, 스크랩)
  const fetchUserInteractions = useCallback(async () => {
    try {
      // 로컬 스토리지에서 이전 상태 복원 (API 실패 시 대체)
      const storedLikedPosts = localStorage.getItem('likedPosts')
      const storedScrapedPosts = localStorage.getItem('scrapedPosts')
      
      let likedPostIds = new Set<number>()
      let scrapedPostIds = new Set<number>()
      
      // 로컬 스토리지에서 복원된 상태가 있으면 사용
      if (storedLikedPosts) {
        try {
          const parsed = JSON.parse(storedLikedPosts)
          if (Array.isArray(parsed)) {
            likedPostIds = new Set(parsed)
          }
        } catch (e) {
          console.warn('로컬 스토리지의 좋아요 데이터 파싱 실패:', e)
        }
      }
      
      if (storedScrapedPosts) {
        try {
          const parsed = JSON.parse(storedScrapedPosts)
          if (Array.isArray(parsed)) {
            scrapedPostIds = new Set(parsed)
          }
        } catch (e) {
          console.warn('로컬 스토리지의 스크랩 데이터 파싱 실패:', e)
        }
      }
      
      // 백엔드 API에서 최신 상태 가져오기
      const [likesResponse, scrapsResponse] = await Promise.all([
        fetch('/api/likes/my'),
        fetch('/api/scraps/my')
      ])
      
      // 좋아요 상태 파싱
      if (likesResponse.ok) {
        const likesData = await likesResponse.json()
        console.log('좋아요 API 응답:', likesData)
        
        // 백엔드 응답 구조에 따라 데이터 파싱
        if (Array.isArray(likesData)) {
          if (likesData.length > 0) {
            const firstItem = likesData[0]
            console.log('첫 번째 좋아요 항목:', firstItem)
            
            if (typeof firstItem === 'number') {
              // 숫자 배열인 경우 (게시글 ID 목록)
              console.log('게시글 ID 배열로 인식')
              likedPostIds = new Set(likesData.map(id => Number(id)))
            } else if (firstItem && typeof firstItem === 'object') {
              // 객체 배열인 경우 (Like 엔티티)
              console.log('Like 엔티티 배열로 인식')
              likedPostIds = new Set(
                likesData
                  .filter((like: any) => like?.targetType === 'POST')
                  .map((like: any) => Number(like?.targetIdx))
              )
            }
          }
        } else if (likesData.content && Array.isArray(likesData.content)) {
          // 페이지네이션된 응답인 경우
          console.log('페이지네이션된 응답으로 인식')
          likedPostIds = new Set(
            likesData.content
              .filter((like: any) => like?.targetType === 'POST')
              .map((like: any) => Number(like?.targetIdx))
          )
        }
        
        console.log('파싱된 좋아요 게시글 ID:', Array.from(likedPostIds))
      } else {
        console.error('좋아요 API 응답 오류:', likesResponse.status)
        console.log('로컬 스토리지의 좋아요 상태를 사용합니다')
      }
      
      // 스크랩 상태 파싱
      if (scrapsResponse.ok) {
        const scrapsData = await scrapsResponse.json()
        console.log('스크랩 API 응답:', scrapsData)
        
        if (Array.isArray(scrapsData)) {
          scrapedPostIds = new Set(scrapsData.map(id => Number(id)))
        }
        console.log('파싱된 스크랩 게시글 ID:', Array.from(scrapedPostIds))
      } else {
        console.error('스크랩 API 응답 오류:', scrapsResponse.status)
        console.log('로컬 스토리지의 스크랩 상태를 사용합니다')
      }
      
      // 게시글 상태 업데이트 (좋아요/스크랩 개수는 백엔드에서 받은 데이터 유지)
      setPosts(prev => {
        const updatedPosts = prev.map((post: Post) => {
          const isLiked = likedPostIds.has(post.postId)
          const isScraped = scrapedPostIds.has(post.postId)
          
          console.log(`게시글 ${post.postId}: liked=${isLiked}, scraped=${isScraped}, likeCount=${post.likeCount}, scrapCount=${post.scrapCount}`)
          
          return {
            ...post,
            liked: isLiked,
            scraped: isScraped
            // likeCount와 scrapCount는 백엔드에서 받은 원본 데이터 유지
          }
        })
        
        console.log('업데이트된 게시글 목록:', updatedPosts.map((p: Post) => ({ 
          postId: p.postId, 
          liked: p.liked, 
          scraped: p.scraped,
          likeCount: p.likeCount,
          scrapCount: p.scrapCount
        })))
        
        return updatedPosts
      })
      
      // 현재 게시글의 상태도 업데이트
      if (currentPost) {
        const isLiked = likedPostIds.has(currentPost.postId)
        const isScraped = scrapedPostIds.has(currentPost.postId)
        
        setIsLiked(isLiked)
        setIsScraped(isScraped)
        
        console.log('현재 게시글 상태 업데이트:', {
          postId: currentPost.postId,
          liked: isLiked,
          scraped: isScraped
        })
      }
      
      // 로컬 스토리지에 최신 상태 저장
      localStorage.setItem('likedPosts', JSON.stringify(Array.from(likedPostIds)))
      localStorage.setItem('scrapedPosts', JSON.stringify(Array.from(scrapedPostIds)))
      
      console.log('사용자 상호작용 상태 로드 완료:', {
        likedPosts: Array.from(likedPostIds),
        scrapedPosts: Array.from(scrapedPostIds)
      })
      
    } catch (error) {
      console.error('사용자 상호작용 상태 로드 실패:', error)
      // 에러 발생 시 로컬 스토리지의 상태를 사용
      console.log('로컬 스토리지의 상태를 사용합니다')
    }
  }, [currentPost])

  // 게시글 목록 가져오기
  const fetchPosts = useCallback(async (page: number = 0) => {
    if (loading || !hasMore) return
    
    setLoading(true)
    setError(null) // 에러 상태 초기화
    try {
      // 백엔드 API URL (환경 변수 사용)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(`${API_BASE_URL}/api/posts?page=${page}&size=10`)
      if (response.ok) {
        const data = await response.json()
        const newPosts = data.content || []
        
        // Post 타입에 맞게 데이터 변환
        const transformedPosts = newPosts.map((post: any) => ({
          postId: post.postId,
          title: post.title || "",
          content: post.content,
          authorName: post.authorName || "익명",
          authorProfileImage: post.authorProfileImage || "/placeholder.svg",
          mediaUrls: post.mediaUrls || [],
          likeCount: post.likeCount || 0, // 백엔드에서 받은 좋아요 개수 유지
          commentCount: post.commentCount || 0,
          scrapCount: post.scrapCount || 0,
          createdAt: post.createdAt,
          tags: post.tags || [],
          liked: false, // 초기값은 false로 설정, fetchUserInteractions에서 실제 상태로 업데이트
          scraped: false, // 초기값은 false로 설정, fetchUserInteractions에서 실제 상태로 업데이트
          type: post.type || "fashion-tip"
        }))
        
        if (page === 0) {
          // 선택한 게시글을 제일 위에 오도록 정렬
          const targetPost = transformedPosts.find((p: Post) => p.postId === postId)
          if (targetPost) {
            // 선택한 게시글을 제거하고 맨 앞에 추가
            const otherPosts = transformedPosts.filter((p: Post) => p.postId !== postId)
            const sortedPosts = [targetPost, ...otherPosts]
            setPosts(sortedPosts)
            
            setCurrentPost(targetPost)
            // 초기 상태는 false로 설정하고, fetchUserInteractions에서 실제 상태로 업데이트
            setIsLiked(false)
            setIsScraped(false)
          } else {
            setPosts(transformedPosts)
          }
        } else {
          setPosts(prev => [...prev, ...transformedPosts])
        }
        
        setHasMore(!data.last)
        setCurrentPage(page)
        
        console.log('게시글 로드 성공:', transformedPosts.map(p => ({ 
          postId: p.postId, 
          likeCount: p.likeCount, 
          scrapCount: p.scrapCount 
        }))) // 디버깅: 좋아요/스크랩 개수 확인
        
        // 게시글이 로드된 후 즉시 사용자 상호작용 상태 확인
        if (page === 0) {
          // 약간의 지연을 두어 상태가 안정화되도록 함
          setTimeout(() => {
            fetchUserInteractions()
          }, 200)
        }
      } else {
        console.error('게시글 로드 실패:', response.status)
        setError(`게시글을 불러오는데 실패했습니다. (${response.status})`)
        // 에러 발생 시 hasMore를 false로 설정하여 더 이상 시도하지 않음
        setHasMore(false)
      }
    } catch (error) {
      console.error('게시글 로드 중 오류:', error)
      // 에러 발생 시 hasMore를 false로 설정하여 더 이상 시도하지 않음
      setHasMore(false)
      
      // 네트워크 에러인 경우 사용자에게 알림
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
      } else {
        setError('게시글을 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [postId, fetchUserInteractions]) // fetchUserInteractions를 의존성에 추가

  // 무한 스크롤을 위한 마지막 요소 관찰
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchPosts(currentPage + 1)
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, hasMore, currentPage, fetchPosts])

  // 컴포넌트 마운트 시 게시글 로드 (한 번만 실행)
  useEffect(() => {
    if (postId) {
      fetchPosts(0)
    }
  }, [postId]) // fetchPosts를 의존성에서 제거하여 무한루프 방지

  // currentPost가 변경될 때마다 사용자 상호작용 상태 확인
  useEffect(() => {
    if (currentPost) {
      fetchUserInteractions()
    }
  }, [currentPost, fetchUserInteractions])

  const toggleLike = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다')
        return
      }

      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ 
          targetIdx: String(postId), 
          targetType: 'POST' 
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('좋아요 토글 응답:', data) // 디버깅 로그
        
        // 모든 게시글의 좋아요 상태와 개수 업데이트
        setPosts(prev => {
          const updatedPosts = prev.map(post => 
            post.postId === postId 
              ? { 
                  ...post, 
                  liked: data.liked, 
                  likeCount: data.count // 서버에서 받은 정확한 개수 사용
                }
              : post
          )
          
          const updatedPost = updatedPosts.find(p => p.postId === postId)
          console.log('업데이트된 게시글:', updatedPost)
          console.log('좋아요 개수 변경:', { 
            이전: prev.find(p => p.postId === postId)?.likeCount, 
            이후: data.count 
          })
          
          return updatedPosts
        })
        
        // 현재 게시글 상태도 업데이트
        setIsLiked(data.liked)
        
        // 로컬 스토리지에 좋아요 상태 저장
        const currentLikedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
        if (data.liked) {
          if (!currentLikedPosts.includes(postId)) {
            currentLikedPosts.push(postId)
          }
        } else {
          const index = currentLikedPosts.indexOf(postId)
          if (index > -1) {
            currentLikedPosts.splice(index, 1)
          }
        }
        localStorage.setItem('likedPosts', JSON.stringify(currentLikedPosts))
        
        console.log('좋아요 상태 업데이트 완료:', { postId, liked: data.liked, count: data.count })
      } else {
        console.error('좋아요 토글 실패:', response.status)
        // 에러 발생 시 사용자에게 알림
        setError(`좋아요 토글에 실패했습니다. (${response.status})`)
      }
    } catch (error) {
      console.error('좋아요 토글 중 오류:', error)
      // 네트워크 에러인 경우 사용자에게 알림
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
      } else {
        setError('좋아요 토글 중 오류가 발생했습니다.')
      }
    }
  }

  const toggleScrap = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다')
        return
      }

      const response = await fetch('/api/scraps/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('스크랩 토글 응답:', data) // 디버깅 로그
        
        // 모든 게시글의 스크랩 상태와 개수 업데이트
        setPosts(prev => {
          const updatedPosts = prev.map(post => 
            post.postId === postId 
              ? { 
                  ...post, 
                  scraped: data.scraped, 
                  scrapCount: data.count // 서버에서 받은 정확한 개수 사용
                }
              : post
          )
          
          const updatedPost = updatedPosts.find(p => p.postId === postId)
          console.log('업데이트된 게시글:', updatedPost)
          console.log('스크랩 개수 변경:', { 
            이전: prev.find(p => p.postId === postId)?.scrapCount, 
            이후: data.count 
          })
          
          return updatedPosts
        })
        
        // 현재 게시글 상태도 업데이트
        setIsScraped(data.scraped)
        
        // 로컬 스토리지에 스크랩 상태 저장
        const currentScrapedPosts = JSON.parse(localStorage.getItem('scrapedPosts') || '[]')
        if (data.scraped) {
          if (!currentScrapedPosts.includes(postId)) {
            currentScrapedPosts.push(postId)
          }
        } else {
          const index = currentScrapedPosts.indexOf(postId)
          if (index > -1) {
            currentScrapedPosts.splice(index, 1)
          }
        }
        localStorage.setItem('scrapedPosts', JSON.stringify(currentScrapedPosts))
        
        console.log('스크랩 상태 업데이트 완료:', { postId, scraped: data.scraped, count: data.count })
      } else {
        console.error('스크랩 토글 실패:', response.status)
        // 에러 발생 시 사용자에게 알림
        setError(`스크랩 토글에 실패했습니다. (${response.status})`)
      }
    } catch (error) {
      console.error('스크랩 토글 중 오류:', error)
      // 네트워크 에러인 경우 사용자에게 알림
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
      } else {
        setError('스크랩 토글 중 오류가 발생했습니다.')
      }
    }
  }

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now(),
        author: "나",
        authorImage: "/placeholder.svg",
        content: commentText,
        date: new Date().toISOString(),
        likes: 0,
        liked: false
      }
      setComments([...comments, newComment])
      setCommentText("")
    }
  }

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-1 h-8 w-8">
          ←
        </Button>
        <div className="font-bold text-lg">커뮤니티</div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Posts Feed */}
      <div className="flex-1">
        {/* 에러 메시지 표시 */}
        {error && (
          <div className="p-4 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button 
              onClick={() => {
                setError(null)
                setHasMore(true)
                fetchPosts(0)
              }}
              variant="outline"
            >
              다시 시도
            </Button>
          </div>
        )}
        
        {posts.map((post, index) => (
          <div 
            key={post.postId} 
            ref={index === posts.length - 1 ? lastPostElementRef : undefined}
            className="border-b"
          >
            {/* User Info */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.authorProfileImage} />
                  <AvatarFallback>{post.authorName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{post.authorName}</div>
                  <div className="text-sm text-gray-500">171cm/63kg · 봄 원돈</div>
                </div>
                <Button 
                  variant={isFollowing ? "outline" : "default"} 
                  size="sm"
                  onClick={toggleFollow}
                >
                  {isFollowing ? "팔로잉" : "+ 팔로우"}
                </Button>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative">
              <img
                src={post.mediaUrls?.[0] || "/placeholder.svg"}
                alt={post.content.substring(0, 20)}
                className="w-full h-auto"
              />
            </div>

            {/* Interaction Buttons */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-4 mb-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleLike(post.postId)} 
                  className="p-2"
                >
                  <Heart className={`w-6 h-6 ${post.liked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <MessageSquare className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Share2 className="w-6 h-6" />
                </Button>
                <div className="ml-auto">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleScrap(post.postId)} 
                    className="p-2"
                  >
                    <Bookmark className={`w-6 h-6 ${post.scraped ? "fill-blue-500 text-blue-500" : ""}`} />
                  </Button>
                </div>
              </div>
              <div className="text-sm font-medium">
                좋아요 {post.likeCount}개 · 스크랩 {post.scrapCount}개
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="p-4 border-b">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="p-4 border-b">
              <div className="text-sm text-gray-500 mb-4">
                {post.commentCount === 0 ? "첫 댓글을 남겨주세요." : `댓글 ${post.commentCount}개`}
              </div>
            </div>

            {/* Post Time */}
            <div className="p-4 text-sm text-gray-500">
              {formatDate(post.createdAt)}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="p-4 text-center text-gray-500">
            게시글을 불러오는 중...
          </div>
        )}
        
        {/* End of Feed */}
        {!hasMore && posts.length > 0 && (
          <div className="p-4 text-center text-gray-500">
            모든 게시글을 불러왔습니다
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="border-t bg-white p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
            className="flex-1"
          />
          <Button onClick={handleCommentSubmit} disabled={!commentText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
