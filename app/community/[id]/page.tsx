"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, Send, Plus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CodyProductList } from "@/components/ui/CodyProductList"
import { CommentsModal } from "@/components/ui/CommentsModal"
import { useRouter, useParams } from "next/navigation"
import { isCurrentUserPostAuthor } from "@/lib/auth-utils"
import { useDeletePost } from "@/hooks/useDeletePost"

interface Comment {
  commentId: number
  content: string
  authorName: string
  authorProfileImage: string
  parentId?: number
  likeCount: number
  isLiked?: boolean
  createdAt: string
  updatedAt: string
  replies?: Comment[]
  // 프론트엔드 호환성을 위한 별칭
  id?: number
  author?: string
  authorImage?: string
  date?: string
  likes?: number
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
  viewCount: number
  createdAt: string
  tags: string[]
  liked?: boolean
  scraped?: boolean
  type?: string
  outfitId?: number
  codyData?: {
    name: string
    items: Array<{
      productId: number
      src: string
      nx: number
      ny: number
      rotation: number
      z: number
      scale: number
    }>
    background: {
      type: 'color' | 'image'
      selectedBackground: string
      customColor: string
    }
    timestamp: number
  }
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = Number(params.id)
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({})
  const [commentsByPost, setCommentsByPost] = useState<Record<number, Comment[]>>({})
  const [isLiked, setIsLiked] = useState(false)
  const [isScraped, setIsScraped] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  const [userInteractionsLoaded, setUserInteractionsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)
  const hasIncrementedView = useRef<Set<number>>(new Set())
  
  // 게시글 삭제 기능
  const { isDeleting, deletePost } = useDeletePost()

  // 조회수 증가 함수 (Redis 기반 - 원자적 연산)
  const incrementViewCount = useCallback(async (postId: number) => {
    // 중복 호출 방지
    if (hasIncrementedView.current.has(postId)) {
      console.log('조회수 중복 호출 방지:', postId)
      return
    }
    
    hasIncrementedView.current.add(postId)
    console.log('조회수 증가 시작:', postId)
    
    try {
      // 백엔드 Redis API 호출 (원자적 연산)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        const newViewCount = data.viewCount || 0
        
        console.log('Redis 조회수 증가 성공:', postId, '->', newViewCount)
        
        // 상태 업데이트
        setPosts(prev => prev.map(post => 
          post.postId === postId 
            ? { ...post, viewCount: newViewCount }
            : post
        ))
        
        setCurrentPost(prev => 
          prev && prev.postId === postId 
            ? { ...prev, viewCount: newViewCount }
            : prev
        )
      } else {
        console.error('Redis 조회수 증가 실패:', response.status)
        // 실패 시 localStorage fallback
        const viewCounts = JSON.parse(localStorage.getItem('postViewCounts') || '{}')
        const currentCount = viewCounts[postId] || 0
        const newViewCount = currentCount + 1
        
        viewCounts[postId] = newViewCount
        localStorage.setItem('postViewCounts', JSON.stringify(viewCounts))
        
        console.log('localStorage fallback 조회수 증가:', postId, currentCount, '->', newViewCount)
        
        setPosts(prev => prev.map(post => 
          post.postId === postId 
            ? { ...post, viewCount: newViewCount }
            : post
        ))
        
        setCurrentPost(prev => 
          prev && prev.postId === postId 
            ? { ...prev, viewCount: newViewCount }
            : prev
        )
      }
      
    } catch (error) {
      console.error('Redis API 호출 실패, localStorage fallback:', error)
      // 네트워크 오류 시 localStorage fallback
      const viewCounts = JSON.parse(localStorage.getItem('postViewCounts') || '{}')
      const currentCount = viewCounts[postId] || 0
      const newViewCount = currentCount + 1
      
      viewCounts[postId] = newViewCount
      localStorage.setItem('postViewCounts', JSON.stringify(viewCounts))
      
      console.log('localStorage fallback 조회수 증가:', postId, currentCount, '->', newViewCount)
      
      setPosts(prev => prev.map(post => 
        post.postId === postId 
          ? { ...post, viewCount: newViewCount }
          : post
      ))
      
      setCurrentPost(prev => 
        prev && prev.postId === postId 
          ? { ...prev, viewCount: newViewCount }
          : prev
      )
    }
  }, [])

  // 사용자 상호작용 상태 가져오기 (좋아요, 스크랩) - 백엔드 API만 사용
  const fetchUserInteractions = useCallback(async () => {
    try {
      // 토큰 가져오기
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('토큰이 없어서 사용자 상태를 불러올 수 없습니다.')
        return
      }
      
      // 백엔드 API에서 최신 상태 가져오기 (Authorization 헤더 포함)
      const [likesResponse, scrapsResponse] = await Promise.all([
        fetch('/api/likes/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/scraps/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])
      
      let likedPostIds = new Set<number>()
      let scrapedPostIds = new Set<number>()
      
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
                  .filter((like: any) => like?.targetType === 'POST' || like?.targetType === 'OUTFIT_SHARE')
                  .map((like: any) => Number(like?.targetIdx))
              )
            }
          }
        } else if (likesData.content && Array.isArray(likesData.content)) {
          // 페이지네이션된 응답인 경우
          console.log('페이지네이션된 응답으로 인식')
          likedPostIds = new Set(
            likesData.content
              .filter((like: any) => like?.targetType === 'POST' || like?.targetType === 'OUTFIT_SHARE')
              .map((like: any) => Number(like?.targetIdx))
          )
        }
        
        console.log('파싱된 좋아요 게시글 ID:', Array.from(likedPostIds))
      } else {
        console.error('좋아요 API 응답 오류:', likesResponse.status)
        throw new Error(`좋아요 API 오류: ${likesResponse.status}`)
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
        throw new Error(`스크랩 API 오류: ${scrapsResponse.status}`)
      }
      
      // 게시글 상태 업데이트 - 백엔드 데이터 그대로 사용
      setPosts(prev => {
        const updatedPosts = prev.map((post: Post) => {
          const isLiked = likedPostIds.has(post.postId)
          const isScraped = scrapedPostIds.has(post.postId)
          
          console.log(`게시글 ${post.postId}: liked=${isLiked}, scraped=${isScraped}, likeCount=${post.likeCount}, scrapCount=${post.scrapCount}`)
          
          return {
            ...post,
            liked: isLiked,
            scraped: isScraped
            // likeCount와 scrapCount는 백엔드에서 받은 원본 데이터 그대로 사용
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
      
      console.log('사용자 상호작용 상태 로드 완료:', {
        likedPosts: Array.from(likedPostIds),
        scrapedPosts: Array.from(scrapedPostIds)
      })
      
    } catch (error) {
      console.error('사용자 상호작용 상태 로드 실패:', error)
      // 에러 발생 시 사용자에게 알림
      setError('사용자 상태를 불러오는데 실패했습니다. 다시 시도해주세요.')
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
        
        // localStorage에서 조회수 가져오기
        const viewCounts = JSON.parse(localStorage.getItem('postViewCounts') || '{}')
        
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
          viewCount: viewCounts[post.postId] || post.viewCount || 0, // localStorage에서 조회수 복원
          createdAt: post.createdAt,
          tags: post.tags || [],
          liked: false, // 초기값은 false로 설정, fetchUserInteractions에서 실제 상태로 업데이트
          scraped: false, // 초기값은 false로 설정, fetchUserInteractions에서 실제 상태로 업데이트
          type: post.type || "fashion-tip",
          outfitId: post.outfitId,
          codyData: post.codyData
        }))
        
        if (page === 0) {
          // 선택한 게시글을 제일 위에 오도록 정렬
          const targetPost = transformedPosts.find((p: Post) => p.postId === postId)
          if (targetPost) {
            // 기존 게시글의 조회수 유지
            setPosts(prev => {
              const existingPost = prev.find(p => p.postId === targetPost.postId)
              const updatedTargetPost = existingPost 
                ? { ...targetPost, viewCount: existingPost.viewCount }
                : targetPost
              
              const otherPosts = transformedPosts.filter((p: Post) => p.postId !== postId)
              return [updatedTargetPost, ...otherPosts]
            })
            
            // currentPost도 조회수 유지
            setCurrentPost(prev => {
              const existingPost = prev?.postId === targetPost.postId ? prev : null
              return existingPost 
                ? { ...targetPost, viewCount: existingPost.viewCount }
                : targetPost
            })
            
            // 초기 상태는 false로 설정하고, fetchUserInteractions에서 실제 상태로 업데이트
            setIsLiked(false)
            setIsScraped(false)
            
            // 선택된 게시글의 조회수 증가
            incrementViewCount(targetPost.postId)
          } else {
            setPosts(transformedPosts)
            // 타겟 게시글을 찾지 못한 경우 첫 번째 게시글을 currentPost로 설정
            if (transformedPosts.length > 0) {
              setCurrentPost(transformedPosts[0])
            }
          }
        } else {
          setPosts(prev => [...prev, ...transformedPosts])
        }
        
        setHasMore(!data.last)
        setCurrentPage(page)
        
        console.log('게시글 로드 성공:', transformedPosts.map((p: Post) => ({ 
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

  // posts가 변경될 때마다 모든 댓글 로드
  useEffect(() => {
    if (posts.length > 0) {
      fetchAllComments()
    }
  }, [posts])

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
        setError('로그인이 필요합니다.')
        return
      }
      
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          targetIdx: postId,
          targetType: 'POST'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('좋아요 토글 응답:', data)
        
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
        
        console.log('좋아요 상태 업데이트 완료:', { postId, liked: data.liked, count: data.count })
      } else {
        console.error('좋아요 토글 실패:', response.status)
        setError('좋아요 토글에 실패했습니다.')
      }
    } catch (error) {
      console.error('좋아요 토글 중 오류:', error)
      setError('좋아요 토글 중 오류가 발생했습니다.')
    }
  }

  const toggleScrap = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('로그인이 필요합니다.')
        return
      }
      
      const response = await fetch('/api/scraps/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('스크랩 토글 응답:', data)
        
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
        
        console.log('스크랩 상태 업데이트 완료:', { postId, scraped: data.scraped, count: data.count })
      } else {
        console.error('스크랩 토글 실패:', response.status)
        setError('스크랩 토글에 실패했습니다.')
      }
    } catch (error) {
      console.error('스크랩 토글 중 오류:', error)
      setError('스크랩 토글 중 오류가 발생했습니다.')
    }
  }

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  // 댓글 데이터 변환 (백엔드 응답을 프론트엔드 형식으로)
  const transformComment = (comment: any): Comment => ({
    ...comment,
    id: comment.commentId,
    author: comment.authorName,
    authorImage: comment.authorProfileImage,
    date: comment.createdAt,
    likes: comment.likeCount,
    liked: comment.isLiked,
    replies: comment.replies?.map(transformComment)
  })

  // 모든 게시글의 댓글 목록 로드
  const fetchAllComments = async () => {
    try {
      const commentPromises = posts.map(async (post) => {
        const response = await fetch(`/api/comments/posts/${post.postId}`)
        if (response.ok) {
          const commentsData = await response.json()
          const transformedComments = commentsData.map(transformComment)
          return { postId: post.postId, comments: transformedComments }
        }
        return { postId: post.postId, comments: [] }
      })
      
      const results = await Promise.all(commentPromises)
      const commentsMap: Record<number, Comment[]> = {}
      results.forEach(({ postId, comments }) => {
        commentsMap[postId] = comments
      })
      
      setCommentsByPost(commentsMap)
    } catch (error) {
      console.error('댓글 로드 실패:', error)
    }
  }

  // 특정 게시글의 댓글 목록 로드
  const fetchComments = async (postId: number) => {
    try {
      const response = await fetch(`/api/comments/posts/${postId}`)
      if (response.ok) {
        const commentsData = await response.json()
        const transformedComments = commentsData.map(transformComment)
        setCommentsByPost(prev => ({
          ...prev,
          [postId]: transformedComments
        }))
      }
    } catch (error) {
      console.error('댓글 로드 실패:', error)
    }
  }

  const handleCommentSubmit = async (postId: number) => {
    const commentText = commentTexts[postId] || ""
    if (commentText.trim()) {
      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: postId,
            content: commentText.trim()
          }),
        })

        if (response.ok) {
          const newComment = await response.json()
          const transformedComment = transformComment(newComment)
          setCommentsByPost(prev => ({
            ...prev,
            [postId]: [transformedComment, ...(prev[postId] || [])]
          }))
          setCommentTexts(prev => ({
            ...prev,
            [postId]: ""
          }))
          // 댓글 수 업데이트
          setPosts(prev => prev.map(post => 
            post.postId === postId 
              ? { ...post, commentCount: post.commentCount + 1 }
              : post
          ))
        }
      } catch (error) {
        console.error('댓글 작성 실패:', error)
      }
    }
  }

  const handleAddComment = async (content: string) => {
    if (selectedPostId) {
      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: selectedPostId,
            content: content.trim()
          }),
        })

        if (response.ok) {
          const newComment = await response.json()
          const transformedComment = transformComment(newComment)
          setCommentsByPost(prev => ({
            ...prev,
            [selectedPostId]: [transformedComment, ...(prev[selectedPostId] || [])]
          }))
          // 댓글 수 업데이트
          setPosts(prev => prev.map(post => 
            post.postId === selectedPostId 
              ? { ...post, commentCount: post.commentCount + 1 }
              : post
          ))
        }
      } catch (error) {
        console.error('댓글 작성 실패:', error)
      }
    }
  }

  const handleLikeComment = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const updatedComment = await response.json()
        const transformedComment = transformComment(updatedComment)
        setCommentsByPost(prev => {
          const newCommentsByPost = { ...prev }
          Object.keys(newCommentsByPost).forEach(postId => {
            newCommentsByPost[parseInt(postId)] = newCommentsByPost[parseInt(postId)].map(comment => 
              comment.commentId === commentId 
                ? { ...comment, liked: transformedComment.liked, likes: transformedComment.likes }
                : comment
            )
          })
          return newCommentsByPost
        })
      }
    } catch (error) {
      console.error('댓글 좋아요 실패:', error)
    }
  }

  const handleReplyComment = async (commentId: number, content: string) => {
    if (selectedPostId) {
      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: selectedPostId,
            content: content.trim(),
            parentId: commentId
          }),
        })

        if (response.ok) {
          const newReply = await response.json()
          const transformedReply = transformComment(newReply)
          setCommentsByPost(prev => {
            const newCommentsByPost = { ...prev }
            Object.keys(newCommentsByPost).forEach(postId => {
              newCommentsByPost[parseInt(postId)] = newCommentsByPost[parseInt(postId)].map(comment => 
                comment.commentId === commentId 
                  ? { ...comment, replies: [...(comment.replies || []), transformedReply] }
                  : comment
              )
            })
            return newCommentsByPost
          })
          // 댓글 수 업데이트
          setPosts(prev => prev.map(post => 
            post.postId === selectedPostId 
              ? { ...post, commentCount: post.commentCount + 1 }
              : post
          ))
        }
      } catch (error) {
        console.error('대댓글 작성 실패:', error)
      }
    }
  }

  // 가장 인기 있는 댓글 찾기 (좋아요 + 대댓글 수)
  const getMostPopularComment = (postId: number) => {
    const comments = commentsByPost[postId] || []
    if (comments.length === 0) return null
    
    return comments.reduce((mostPopular, comment) => {
      const commentScore = (comment.likes || comment.likeCount) + (comment.replies?.length || 0)
      const mostPopularScore = (mostPopular.likes || mostPopular.likeCount) + (mostPopular.replies?.length || 0)
      return commentScore > mostPopularScore ? comment : mostPopular
    })
  }

  const handleDeletePost = async () => {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      const success = await deletePost(postId)
      if (success) {
        // 게시글 삭제 성공 시 커뮤니티 메인으로 이동
        router.push('/community')
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
                {/* 자신의 게시글인지 확인 후 버튼 선택 */}
                {isCurrentUserPostAuthor(post.authorName) ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePost()
                    }}
                    disabled={isDeleting}
                    className="p-2 hover:bg-gray-100"
                    data-testid="delete-post-button"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </Button>
                ) : (
                  <Button 
                    variant={isFollowing ? "outline" : "default"} 
                    size="sm"
                    onClick={toggleFollow}
                  >
                    {isFollowing ? "팔로잉" : "+ 팔로우"}
                  </Button>
                )}
              </div>
            </div>

            {/* Main Image */}
            <div className="relative">
              {post.codyData && post.codyData.items && post.codyData.items.length > 0 ? (
                <div className="space-y-4">
                  {/* 코디 이미지 */}
                  <img
                    src={post.mediaUrls?.[0] || "/placeholder.svg"}
                    alt={post.content.substring(0, 20)}
                    className="w-full h-auto"
                  />
                  
                  {/* 코디 상품 정보 */}
                  <div className="px-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      사용된 상품
                    </h4>
                    <CodyProductList
                      items={post.codyData.items.map(item => ({
                        id: item.productId.toString(),
                        itemId: item.productId.toString(),
                        name: `상품 ${item.productId}`,
                        src: item.src,
                        slot: 'accessory' as const,
                        nx: item.nx,
                        ny: item.ny,
                        rotation: item.rotation,
                        z: item.z,
                        scale: item.scale,
                        visible: true,
                        anchor: 'center' as const,
                        stateVersion: 1
                      }))}
                      showScrollButtons={true}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={post.mediaUrls?.[0] || "/placeholder.svg"}
                  alt={post.content.substring(0, 20)}
                  className="w-full h-auto"
                />
              )}
            </div>

            {/* Post Content */}
            {post.content && (
              <div className="px-4 py-2">
                <p className="text-sm text-gray-900">{post.content}</p>
              </div>
            )}

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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2"
                  onClick={() => {
                    setSelectedPostId(post.postId)
                    setIsCommentsModalOpen(true)
                  }}
                >
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
                좋아요 {post.likeCount}개 · 스크랩 {post.scrapCount}개 · 조회 {post.viewCount || 0}회
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
              
              {/* 가장 인기 있는 댓글 하나만 표시 */}
              {commentsByPost[post.postId] && commentsByPost[post.postId].length > 0 && (
                <div className="space-y-3">
                  {(() => {
                    const mostPopularComment = getMostPopularComment(post.postId)
                    if (!mostPopularComment) return null
                    
                    return (
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={mostPopularComment.authorImage || mostPopularComment.authorProfileImage} />
                          <AvatarFallback>{(mostPopularComment.author || mostPopularComment.authorName).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{mostPopularComment.author || mostPopularComment.authorName}</span>
                          <span className="text-xs text-gray-500">{formatDate(mostPopularComment.date || mostPopularComment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-900">{mostPopularComment.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-6"
                            onClick={() => handleLikeComment(mostPopularComment.commentId)}
                          >
                            <Heart className={`w-4 h-4 ${(mostPopularComment.liked || mostPopularComment.isLiked) ? "fill-red-500 text-red-500" : ""}`} />
                          </Button>
                          <span className="text-xs text-gray-500">{(mostPopularComment.likes || mostPopularComment.likeCount)}개</span>
                        </div>
                        </div>
                      </div>
                    )
                  })()}
                  
                  {/* 더보기 버튼 */}
                  {(commentsByPost[post.postId]?.length || 0) > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                      onClick={() => {
                        setSelectedPostId(post.postId)
                        setIsCommentsModalOpen(true)
                      }}
                    >
                      댓글 {(commentsByPost[post.postId]?.length || 0) - 1}개 더보기
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Post Time */}
            <div className="p-4 text-sm text-gray-500">
              {formatDate(post.createdAt)}
            </div>

            {/* Comment Input for each post */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="댓글을 입력하세요..."
                  value={commentTexts[post.postId] || ""}
                  onChange={(e) => setCommentTexts(prev => ({
                    ...prev,
                    [post.postId]: e.target.value
                  }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.postId)}
                  className="flex-1"
                />
                <Button onClick={() => handleCommentSubmit(post.postId)} disabled={!(commentTexts[post.postId] || "").trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
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

      {/* Comments Modal */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => {
          setIsCommentsModalOpen(false)
          setSelectedPostId(null)
        }}
        comments={selectedPostId ? (commentsByPost[selectedPostId] || []) : []}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onReplyComment={handleReplyComment}
        formatDate={formatDate}
      />
    </div>
  )
}
