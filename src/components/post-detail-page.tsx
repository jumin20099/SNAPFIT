"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ArrowLeft, Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, Send, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useFollow } from "@/hooks/useFollow"
import { useComments } from "@/hooks/useComments"

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

interface PostDetailProps {
  isOpen: boolean
  onClose: () => void
  postId: number
}

export default function PostDetailPage({ isOpen, onClose, postId }: PostDetailProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [commentText, setCommentText] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isScraped, setIsScraped] = useState(false)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  
  // 첫 번째 게시글 작성자의 팔로우 기능
  const firstPost = posts[0]
  const { isFollowing, followerCount, isLoading: followLoading, toggleFollow } = useFollow(
    firstPost?.authorName || '' // 실제로는 authorId를 사용해야 함
  )
  
  // 댓글 기능
  const { 
    comments, 
    isLoading: commentsLoading, 
    error: commentsError,
    hasMore: hasMoreComments,
    createComment, 
    updateComment,
    deleteComment,
    toggleCommentLike,
    loadMoreComments
  } = useComments(postId)
  const observer = useRef<IntersectionObserver | null>(null)

  // 게시글 목록 가져오기
  const fetchPosts = useCallback(async (page: number = 0) => {
    if (loading || !hasMore) return
    
    setLoading(true)
    try {
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
          setPosts(transformedPosts)
        } else {
          setPosts(prev => [...prev, ...transformedPosts])
        }
        
        setHasMore(!data.last)
        setCurrentPage(page)
        
        // 현재 게시글 찾기
        if (page === 0) {
          const targetPost = transformedPosts.find((p: Post) => p.postId === postId)
          if (targetPost) {
            setCurrentPost(targetPost)
            setIsLiked(targetPost.liked || false)
            setIsScraped(targetPost.scraped || false)
          }
        }
        
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
    if (isOpen) {
      fetchPosts(0)
    }
  }, [isOpen, fetchPosts])

  const toggleLike = (postId: number) => {
    setPosts(prev => 
      prev.map(post => 
        post.postId === postId 
          ? { ...post, liked: !post.liked, likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1 }
          : post
      )
    )
    
    if (currentPost?.postId === postId) {
      setIsLiked(!isLiked)
    }
  }

  const toggleScrap = (postId: number) => {
    setPosts(prev => 
      prev.map(post => 
        post.postId === postId 
          ? { ...post, scraped: !post.scraped, scrapCount: post.scraped ? post.scrapCount - 1 : post.scrapCount + 1 }
          : post
      )
    )
    
    if (currentPost?.postId === postId) {
      setIsScraped(!isScraped)
    }
  }



  const handleCommentSubmit = async () => {
    if (commentText.trim() && !commentsLoading) {
      try {
        await createComment(commentText.trim());
        setCommentText("");
      } catch (error) {
        console.error('댓글 작성 실패:', error);
        // 에러 처리는 useComments에서 관리
      }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="font-bold text-lg">커뮤니티</div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto">
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
                  <div className="font-medium" data-testid="post-author">{post.authorName}</div>
                  <div className="text-sm text-gray-500">
                    <span data-testid="follower-count">팔로워 {followerCount}명</span> · 171cm/63kg · 봄 원돈
                  </div>
                </div>
                <Button 
                  variant={isFollowing ? "outline" : "default"} 
                  size="sm"
                  onClick={toggleFollow}
                  disabled={followLoading}
                  data-testid="follow-button"
                >
                  {followLoading ? "처리중..." : (isFollowing ? "팔로잉" : "+ 팔로우")}
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
              <div className="text-sm font-medium">좋아요 {post.likeCount}개</div>
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
            <div className="p-4 border-b" data-testid="comments-list">
              <div className="text-sm text-gray-500 mb-4">
                {comments.length === 0 ? "첫 댓글을 남겨주세요." : `댓글 ${comments.length}개`}
              </div>
              
              {/* Comments List */}
              {comments.length > 0 && (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.commentId} className="flex gap-3" data-testid="comment-item">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.profileImage} />
                        <AvatarFallback>{comment.author.nickname?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="font-medium text-sm">{comment.author.nickname}</div>
                          <div className="text-sm">{comment.content}</div>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{formatDate(comment.createdAt)}</span>
                          <button 
                            onClick={() => toggleCommentLike(comment.commentId)}
                            className="flex items-center gap-1 hover:text-red-500"
                            data-testid="comment-like-btn"
                          >
                            <Heart className={`w-3 h-3 ${comment.liked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span data-testid="comment-like-count">{comment.likeCount}</span>
                          </button>
                          <button className="hover:text-gray-700" data-testid="comment-edit-btn">답글</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Load More Comments */}
              {hasMoreComments && (
                <Button 
                  variant="ghost" 
                  onClick={loadMoreComments}
                  disabled={commentsLoading}
                  className="w-full mt-4"
                  data-testid="load-more-comments"
                >
                  {commentsLoading ? "로딩 중..." : "댓글 더 보기"}
                </Button>
              )}
              
              {/* Comments Error */}
              {commentsError && (
                <div className="text-red-500 text-sm mt-2">
                  {commentsError}
                </div>
              )}
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
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCommentSubmit()}
            className="flex-1"
            data-testid="comment-input"
            disabled={commentsLoading}
          />
          <Button 
            onClick={handleCommentSubmit} 
            disabled={!commentText.trim() || commentsLoading}
            data-testid="comment-submit"
          >
            {commentsLoading ? "전송중..." : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
