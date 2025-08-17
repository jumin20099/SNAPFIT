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
  const observer = useRef<IntersectionObserver>()

  // 게시글 목록 가져오기
  const fetchPosts = useCallback(async (page: number = 0) => {
    if (loading || !hasMore) return
    
    setLoading(true)
    try {
      // 백엔드 API URL (Spring Boot 기본 포트: 8080)
      const response = await fetch(`http://localhost:8080/api/posts?page=${page}&size=10`)
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
          likeCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          scrapCount: post.scrapCount || 0,
          createdAt: post.createdAt,
          tags: post.tags || [],
          liked: post.isLiked || false,
          scraped: post.isScrapped || false,
          type: post.type || "fashion-tip"
        }))
        
        if (page === 0) {
          // 선택한 게시글을 제일 위에 오도록 정렬
          const targetPost = transformedPosts.find(p => p.postId === postId)
          if (targetPost) {
            // 선택한 게시글을 제거하고 맨 앞에 추가
            const otherPosts = transformedPosts.filter(p => p.postId !== postId)
            const sortedPosts = [targetPost, ...otherPosts]
            setPosts(sortedPosts)
            
            setCurrentPost(targetPost)
            setIsLiked(targetPost.liked || false)
            setIsScraped(targetPost.scraped || false)
          } else {
            setPosts(transformedPosts)
          }
        } else {
          setPosts(prev => [...prev, ...transformedPosts])
        }
        
        setHasMore(!data.last)
        setCurrentPage(page)
        
        console.log('게시글 로드 성공:', transformedPosts)
      } else {
        console.error('게시글 로드 실패:', response.status)
      }
    } catch (error) {
      console.error('게시글 로드 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, postId])

  // 무한 스크롤을 위한 마지막 요소 관찰
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(currentPage + 1)
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, hasMore, currentPage, fetchPosts])

  // 컴포넌트 마운트 시 게시글 로드
  useEffect(() => {
    if (postId) {
      fetchPosts(0)
    }
  }, [postId, fetchPosts])

  // 사용자별 좋아요 및 스크랩 상태 가져오기
  useEffect(() => {
    const fetchUserInteractions = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        // 좋아요 상태 가져오기
        const likesResponse = await fetch('http://localhost:8080/api/likes/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (likesResponse.ok) {
          const likesData = await likesResponse.json()
          const likedPostIds = new Set(
            likesData
              .filter((like: any) => like?.targetType === 'POST')
              .map((like: any) => Number(like?.targetIdx))
          )
          
          setPosts(prev => prev.map(post => ({
            ...post,
            liked: likedPostIds.has(post.postId)
          })))
          
          // 현재 게시글의 좋아요 상태 설정
          if (currentPost && likedPostIds.has(currentPost.postId)) {
            setIsLiked(true)
          }
        }

        // 스크랩 상태 가져오기
        const scrapsResponse = await fetch('http://localhost:8080/api/scraps/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (scrapsResponse.ok) {
          const scrapsData = await scrapsResponse.json()
          const scrapedPostIds = new Set(
            scrapsData
              .filter((scrap: any) => scrap?.post?.postId)
              .map((scrap: any) => Number(scrap?.post?.postId))
          )
          
          setPosts(prev => prev.map(post => ({
            ...post,
            scraped: scrapedPostIds.has(post.postId)
          })))
          
          // 현재 게시글의 스크랩 상태 설정
          if (currentPost && scrapedPostIds.has(currentPost.postId)) {
            setIsScraped(true)
          }
        }
      } catch (error) {
        console.error('사용자 상호작용 상태 가져오기 실패:', error)
      }
    }

    if (posts.length > 0 && currentPost) {
      fetchUserInteractions()
    }
  }, [currentPost, posts.length])

  const toggleLike = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다')
        return
      }

      const response = await fetch(`http://localhost:8080/api/likes/toggle?targetIdx=${postId}&targetType=POST`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // 모든 게시글의 좋아요 상태 업데이트
        setPosts(prev => 
          prev.map(post => 
            post.postId === postId 
              ? { ...post, liked: data.liked, likeCount: data.count }
              : post
          )
        )
        
        // 현재 게시글의 좋아요 상태 즉시 업데이트
        if (currentPost?.postId === postId) {
          setIsLiked(data.liked)
        }
      } else {
        console.error('좋아요 토글 실패:', response.status)
      }
    } catch (error) {
      console.error('좋아요 토글 중 오류:', error)
    }
  }

  const toggleScrap = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다')
        return
      }

      const response = await fetch(`http://localhost:8080/api/scraps/toggle?postId=${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // 모든 게시글의 스크랩 상태 업데이트
        setPosts(prev => 
          prev.map(post => 
            post.postId === postId 
              ? { ...post, scraped: data.scraped, scrapCount: data.count }
              : post
          )
        )
        
        // 현재 게시글의 스크랩 상태 즉시 업데이트
        if (currentPost?.postId === postId) {
          setIsScraped(data.scraped)
        }
      } else {
        console.error('스크랩 토글 실패:', response.status)
      }
    } catch (error) {
      console.error('스크랩 토글 중 오류:', error)
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
                  <Heart className={`w-6 h-6 ${post.postId === currentPost?.postId ? isLiked : post.liked ? "fill-red-500 text-red-500" : ""}`} />
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
                    <Bookmark className={`w-6 h-6 ${post.postId === currentPost?.postId ? isScraped : post.scraped ? "fill-blue-500 text-blue-500" : ""}`} />
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
