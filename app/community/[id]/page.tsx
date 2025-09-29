"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, Send, User } from "lucide-react"
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
import { LikeButton } from "@/features/reactions/LikeButton"
import { ScrapButton } from "@/features/reactions/ScrapButton"
import { CommentLikeButton } from "@/features/reactions/CommentLikeButton"
import { useBatchReactionStatus } from "@/shared/hooks/useBatchReactionStatus"

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
  authorId?: string
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
  authorHeightCm?: number | null
  authorWeightKg?: number | string | null
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
  const initialSort = useMemo(() => {
    if (typeof window === 'undefined') return 'popular' as const
    const currentParams = new URLSearchParams(window.location.search)
    const sortParam = currentParams.get('sort')
    if (sortParam === 'latest' || sortParam === 'popular' || sortParam === 'mostCommented' || sortParam === 'trending') {
      return sortParam
    }
    return 'popular' as const
  }, [])
  
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
      // 조회수 중복 호출 방지
      return
    }
    
    hasIncrementedView.current.add(postId)
    // 조회수 증가 시작
    
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
        
        // Redis 조회수 증가 성공
        
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
        // 좋아요 API 응답
        
        // 백엔드 응답 구조에 따라 데이터 파싱
        if (Array.isArray(likesData)) {
          if (likesData.length > 0) {
            const firstItem = likesData[0]
            // 첫 번째 좋아요 항목
            
            if (typeof firstItem === 'number') {
              // 숫자 배열인 경우 (게시글 ID 목록)
              // 게시글 ID 배열로 인식
              likedPostIds = new Set(likesData.map(id => Number(id)))
            } else if (firstItem && typeof firstItem === 'object') {
              // 객체 배열인 경우 (Like 엔티티)
              // Like 엔티티 배열로 인식
              likedPostIds = new Set(
                likesData
                  .filter((like: any) => like?.targetType === 'POST' || like?.targetType === 'OUTFIT_SHARE')
                  .map((like: any) => Number(like?.targetIdx))
              )
            }
          }
        } else if (likesData.content && Array.isArray(likesData.content)) {
          // 페이지네이션된 응답인 경우
          // 페이지네이션된 응답으로 인식
          likedPostIds = new Set(
            likesData.content
              .filter((like: any) => like?.targetType === 'POST' || like?.targetType === 'OUTFIT_SHARE')
              .map((like: any) => Number(like?.targetIdx))
          )
        }
        
        // 파싱된 좋아요 게시글 ID
      } else {
        console.error('좋아요 API 응답 오류:', likesResponse.status)
        throw new Error(`좋아요 API 오류: ${likesResponse.status}`)
      }
      
      // 스크랩 상태 파싱
      if (scrapsResponse.ok) {
        const scrapsData = await scrapsResponse.json()
        // 스크랩 API 응답
        
        if (Array.isArray(scrapsData)) {
          scrapedPostIds = new Set(scrapsData.map(id => Number(id)))
        }
        // 파싱된 스크랩 게시글 ID
      } else {
        console.error('스크랩 API 응답 오류:', scrapsResponse.status)
        throw new Error(`스크랩 API 오류: ${scrapsResponse.status}`)
      }
      
      // 게시글 상태 업데이트 - 백엔드 데이터 그대로 사용
      setPosts(prev => {
        const updatedPosts = prev.map((post: Post) => {
          const isLiked = likedPostIds.has(post.postId)
          const isScraped = scrapedPostIds.has(post.postId)
          
          // 게시글 상태 업데이트
          
          return {
            ...post,
            liked: isLiked,
            scraped: isScraped
            // likeCount와 scrapCount는 백엔드에서 받은 원본 데이터 그대로 사용
          }
        })
        
        // 업데이트된 게시글 목록
        
        return updatedPosts
      })

      // 배치 상태 조회로 정확한 상태 업데이트
      if (posts.length > 0) {
        try {
          const postIds = posts.map(post => post.postId)
          console.log('개별 게시글 페이지 배치 상태 조회 요청:', { postIds, token: token.substring(0, 10) + '...' })
          
          const statusResponse = await fetch('/api/reactions/status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ postIds })
          })
          
          console.log('개별 게시글 페이지 배치 상태 조회 응답:', statusResponse.status, statusResponse.statusText)
          
          if (!statusResponse.ok) {
            const errorText = await statusResponse.text()
            console.error('배치 상태 조회 실패:', errorText)
            return
          }
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            // 개별 게시글 페이지 배치 상태 조회 결과
            
            // 상태 업데이트
            setPosts(prevPosts => {
              const updatedPosts = prevPosts.map(post => {
                const status = statusData[`post_${post.postId}`]
                if (status) {
                  return {
                    ...post,
                    liked: status.liked,
                    scraped: status.scraped,
                    likeCount: status.likeCount,
                    scrapCount: status.scrapCount
                  }
                }
                return post
              })
              
              // 배치 상태 조회로 업데이트된 게시글 목록
              return updatedPosts
            })
          }
        } catch (statusError) {
          console.error('개별 게시글 페이지 배치 상태 조회 실패, 기본 상태 사용:', statusError)
        }
      }
      
      // 현재 게시글의 상태도 업데이트
      if (currentPost) {
        const isLiked = likedPostIds.has(currentPost.postId)
        const isScraped = scrapedPostIds.has(currentPost.postId)
        
        setIsLiked(isLiked)
        setIsScraped(isScraped)
        
        // 현재 게시글 상태 업데이트

        // 배치 상태 조회로 현재 게시글 상태도 정확히 업데이트
        try {
          const statusResponse = await fetch('/api/reactions/status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ postIds: [currentPost.postId] })
          })
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            const status = statusData[`post_${currentPost.postId}`]
            if (status) {
              // 현재 게시글 배치 상태 조회 결과
              setIsLiked(status.liked)
              setIsScraped(status.scraped)
            }
          }
        } catch (statusError) {
          console.error('현재 게시글 배치 상태 조회 실패:', statusError)
        }
      }
      
      // 사용자 상호작용 상태 로드 완료
      
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
      // Next.js API 라우트 사용 (프록시를 통해 백엔드 호출)
      const token = localStorage.getItem('token')
      
      // 특정 게시글을 포함한 목록 요청 (첫 페이지인 경우)
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
      })

      if (page === 0) {
        params.append('includePostId', postId.toString())
      }

      const serverSortParam = initialSort === 'latest' ? 'createdAt,desc' : undefined
      if (serverSortParam) {
        params.append('sort', serverSortParam)
      }

      const url = `/api/posts?${params.toString()}`
      
      const response = await fetch(url, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      if (response.ok) {
        const data = await response.json()
        const newPosts = data.content || []
        
        // localStorage에서 조회수 가져오기
        const viewCounts = JSON.parse(localStorage.getItem('postViewCounts') || '{}')
        
        // Post 타입에 맞게 데이터 변환
        const transformedPosts = newPosts.map((post: any, index: number) => {
          const createdAtRaw = post.createdAt ?? post.created_at ?? post.created_at ?? null
          const updatedAtRaw = post.updatedAt ?? post.updated_at ?? null

          if (process.env.NODE_ENV === 'development') {
            // raw timestamps
          }

          // 배치 상태에서 현재 게시글의 상태 가져오기 (타입 안전)
          const status = reactionManager.getPostStatus(post.postId);
          
          return {
            postId: post.postId,
            title: post.title || "",
            content: post.content,
            authorName: post.authorName || "익명",
            authorId: post.authorId || post.userId || null,
            authorProfileImage: post.authorProfileImage || "/placeholder.svg",
            mediaUrls: post.mediaUrls || [],
            likeCount: (status?.likeCount ?? post.likeCount) || 0, // 배치 상태 우선, 없으면 백엔드 값
            commentCount: post.commentCount || 0,
            scrapCount: (status?.scrapCount ?? post.scrapCount) || 0, // 배치 상태 우선, 없으면 백엔드 값
            viewCount: viewCounts[post.postId] || post.viewCount || 0, // localStorage에서 조회수 복원
            createdAt: createdAtRaw,
            updatedAt: updatedAtRaw,
            authorHeightCm: post.authorHeightCm ?? post.author_height_cm ?? null,
            authorWeightKg: post.authorWeightKg ?? post.author_weight_kg ?? null,
            tags: post.tags || [],
            // 배치 상태 우선, 없으면 백엔드 응답 필드명을 프론트엔드 기대 형식으로 변환
            liked: status?.liked ?? (post.isLiked || false),
            scraped: status?.scraped ?? (post.isScrapped || false),
            type: post.type || "fashion-tip",
            outfitId: post.outfitId,
            codyData: post.codyData
          };
        })
        
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
              
              // 타겟 게시글을 제외한 나머지 게시글들을 생성일 기준으로 정렬
              const otherPosts = transformedPosts
                .filter((p: Post) => p.postId !== postId)
                .sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              
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
            // 타겟 게시글을 찾지 못한 경우 생성일 기준으로 정렬
            const sortedPosts = transformedPosts.sort((a: Post, b: Post) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            setPosts(sortedPosts)
            
            // 첫 번째 게시글을 currentPost로 설정
            if (sortedPosts.length > 0) {
              setCurrentPost(sortedPosts[0])
            }
          }
        } else {
          // 추가 페이지 로드 시에도 정렬 유지
          const sortedNewPosts = transformedPosts.sort((a: Post, b: Post) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setPosts(prev => {
            const updatedPosts = [...prev, ...sortedNewPosts]
            // 새로 추가된 게시글들의 댓글 로드
            setTimeout(() => {
              fetchAllComments(false, sortedNewPosts)
            }, 100)
            return updatedPosts
          })
          // 무한 스크롤로 새 게시글이 추가되면 useBatchReactionStatus 훅이 자동으로 실행됨
          console.log('무한 스크롤로 새 게시글 추가됨')
        }
        
        setHasMore(!data.last)
        setCurrentPage(page)
        
        // 게시글 로드 완료
        
        // 게시글이 로드된 후 즉시 사용자 상호작용 상태 확인
        if (page === 0) {
          // 약간의 지연을 두어 상태가 안정화되도록 함
          setTimeout(() => {
            fetchUserInteractions()
          }, 200)
        }
        
        // 로드된 게시글 반환 (모든 경우에 반환)
        return transformedPosts
      } else {
        console.error('게시글 로드 실패:', response.status)
        setError(`게시글을 불러오는데 실패했습니다. (${response.status})`)
        // 에러 발생 시 hasMore를 false로 설정하여 더 이상 시도하지 않음
        setHasMore(false)
        return []
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
      return []
    } finally {
      setLoading(false)
    }
  }, [postId, fetchUserInteractions, initialSort]) // fetchUserInteractions를 의존성에 추가

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

  // 통합 배치 상태 조회 (게시글 + 댓글) - 게시글 변경 시 자동 실행
  const allCommentIds = Object.values(commentsByPost).flat().map(comment => comment.commentId)
  const { data: batchReactionStatus, manager: reactionManager, refetch: refetchBatchStatus } = useBatchReactionStatus({
    postIds: posts.map(p => p.postId),
    commentIds: allCommentIds,
    enabled: posts.length > 0 // 게시글이 있을 때 자동 실행
  })

  // 배치 상태 조회 결과를 게시글 상태에 즉시 적용
  useEffect(() => {
    if (batchReactionStatus && posts.length > 0) {
      console.log('배치 상태 조회 결과 적용 시작:', batchReactionStatus);
      
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          const status = reactionManager.getPostStatus(post.postId);
          
          if (status) {
            // 게시글 상태 업데이트
            
            return {
              ...post,
              liked: status.liked ?? post.liked,
              scraped: status.scraped ?? post.scraped,
              likeCount: status.likeCount ?? post.likeCount,
              scrapCount: status.scrapCount ?? post.scrapCount
            };
          }
          return post;
        });
        
        // 게시글 상태 동기화 완료
        return updatedPosts;
      });
    }
  }, [batchReactionStatus]);

  // 통합 데이터 로딩 (한 번만 실행)
  useEffect(() => {
    if (postId) {
      const loadData = async () => {
        // 1. 게시글 로드
        const loadedPosts = await fetchPosts(0)
        
        // 2. 게시글 로딩 완료 후 댓글 로드
        if (loadedPosts && loadedPosts.length > 0) {
          // 댓글 로딩 시작 - 게시글 로딩 완료 후
      const isRefresh = performance.navigation && performance.navigation.type === 1
          await fetchAllComments(isRefresh, loadedPosts)
          await fetchUserInteractions()
        }
      }
      
      loadData()
    }
  }, [postId]) // postId만 의존성으로 설정

  // 배치 상태 조회 결과로 댓글 상태 업데이트 (무한루프 방지)
  const prevBatchStatusRef = useRef<string | null>(null)
  
  useEffect(() => {
    if (batchReactionStatus && allCommentIds.length > 0) {
      // 이전 상태와 비교하여 변경된 경우에만 업데이트
      const statusString = JSON.stringify(batchReactionStatus)
      if (prevBatchStatusRef.current === statusString) {
        // 댓글 상태 변경 없음, 스킵
        return
      }
      
      // 댓글 상태 업데이트 시작
      
      setCommentsByPost(prevComments => {
        const updatedComments = { ...prevComments }
        let hasChanges = false
        
        Object.keys(updatedComments).forEach(postId => {
          updatedComments[parseInt(postId)] = updatedComments[parseInt(postId)].map(comment => {
            const status = reactionManager.getCommentStatus(comment.commentId)
            if (status) {
              const newComment = {
                ...comment,
                liked: status.liked || false,
                likeCount: status.likeCount || 0,
                isLiked: status.liked || false,
                likes: status.likeCount || 0
              }
              
              // 실제로 변경된 경우에만 hasChanges를 true로 설정
              if (comment.liked !== newComment.liked || comment.likeCount !== newComment.likeCount) {
                hasChanges = true
                // 댓글 상태 변경
              }
              
              return newComment
            }
            return comment
          })
        })
        
        if (hasChanges) {
          // 댓글 상태 업데이트 완료 (변경사항 있음)
        } else {
          // 댓글 상태 업데이트 완료 (변경사항 없음)
        }
        
        return updatedComments
      })
      
      // 현재 상태를 저장
      prevBatchStatusRef.current = statusString
    }
  }, [batchReactionStatus, allCommentIds])

  // 댓글 상태 디버깅
  useEffect(() => {
    console.log('댓글 상태 변경:', { 
      commentsByPost, 
      allCommentIds, 
      batchReactionStatus: !!batchReactionStatus 
    })
  }, [commentsByPost, allCommentIds, batchReactionStatus])

  // 좋아요 토글 함수는 이제 LikeButton 컴포넌트에서 처리

  // 스크랩 토글 함수는 이제 ScrapButton 컴포넌트에서 처리

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

  // 모든 게시글의 댓글 목록 로드 (새로고침 시에만 인기순 정렬)
  const fetchAllComments = async (usePopularSort = false, postsToLoad = posts) => {
    try {
      // 댓글 로딩 시작
      
      if (postsToLoad.length === 0) {
        // 게시글이 없어서 댓글을 로드할 수 없습니다
        return
      }

      // 이미 댓글이 로드된 게시글은 제외 (중복 로딩 방지)
      const postsNeedingComments = postsToLoad.filter(post => !commentsByPost[post.postId])
      // 댓글이 필요한 게시글
      
      if (postsNeedingComments.length === 0) {
        // 모든 게시글의 댓글이 이미 로드되어 있습니다
        return
      }
      
      const commentPromises = postsNeedingComments.map(async (post) => {
        const sortParam = usePopularSort ? '?sortBy=popular' : '?sortBy=time'
        // 댓글 API 호출
        
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/comments/posts/${post.postId}${sortParam}`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        })
        if (response.ok) {
          const commentsData = await response.json()
          // 게시글 댓글 데이터
          const transformedComments = commentsData.map(transformComment)
          return { postId: post.postId, comments: transformedComments }
        } else {
          console.error(`댓글 API 실패: ${post.postId}`, response.status, response.statusText)
        }
        return { postId: post.postId, comments: [] }
      })
      
      const results = await Promise.all(commentPromises)
      // 댓글 로딩 결과
      
      const commentsMap: Record<number, Comment[]> = {}
      results.forEach(({ postId, comments }) => {
        commentsMap[postId] = comments
        // 게시글 댓글 수
      })
      
      // 기존 댓글 상태와 새 댓글 상태를 병합
      setCommentsByPost(prevComments => ({
        ...prevComments,
        ...commentsMap
      }))
      console.log('댓글 상태 설정 완료:', commentsMap)
    } catch (error) {
      console.error('댓글 로드 실패:', error)
    }
  }

  // 특정 게시글의 댓글 목록 로드 (시간순 정렬)
  const fetchComments = async (postId: number) => {
    try {
      const response = await fetch(`/api/comments/posts/${postId}?sortBy=time`)
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
        const token = localStorage.getItem('token')
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
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
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

  const handleDeletePost = async (targetPostId: number, requiresPassword: boolean) => {
    let password: string | undefined

    if (requiresPassword) {
      const input = window.prompt('게시글 작성 시 설정한 비밀번호를 입력해주세요.')
      if (!input || !input.trim()) {
        alert('비밀번호를 입력해야 삭제할 수 있습니다.')
        return
      }
      password = input.trim()
      if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
        return
      }
    } else {
      if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
        return
      }
    }

    const success = await deletePost(targetPostId, password)
    if (success) {
      setPosts(prev => prev.filter(post => post.postId !== targetPostId))
      setCurrentPost(prev => (prev && prev.postId === targetPostId ? null : prev))
      router.push('/community')
    }
  }

  const handleEditPost = (targetPostId: number) => {
    router.push(`/community/create?edit=${targetPostId}`)
  }

  // 프로필 버튼 클릭 핸들러
  const handleProfileClick = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('로그인 후 사용 가능합니다.')
      return
    }
    
    // 토큰이 있으면 사용자 정보를 가져와서 프로필 페이지로 이동
    fetchUserProfile()
  }

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        const userId = userData.userIdx || userData.id
        if (userId) {
          router.push(`/profile/${userId}`)
        } else {
          alert('사용자 정보를 가져올 수 없습니다.')
        }
      } else {
        alert('로그인 후 사용 가능합니다.')
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error)
      alert('로그인 후 사용 가능합니다.')
    }
  }

  const logDateDebug = (label: string, payload: Record<string, unknown>) => {
    // 디버그 로그 비활성화
  }

  const parseDate = (value?: string | number | null) => {
    if (value === null || value === undefined) return null

    if (typeof value === 'number') {
      const date = new Date(value)
      const valid = !Number.isNaN(date.getTime())
      logDateDebug('parse-number', { value, valid })
      return valid ? date : null
    }

    const trimmed = String(value).trim()
    if (!trimmed) return null

    let date = new Date(trimmed)
    if (!Number.isNaN(date.getTime())) {
      logDateDebug('parse-native', { value: trimmed, iso: date.toISOString() })
      return date
    }

    // Safari는 'YYYY-MM-DD HH:mm:ss' 형식을 지원하지 않으므로 직접 파싱
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/)
    if (match) {
      const [, year, month, day, hour, minute, second] = match
      date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second ?? '0')
      )
      if (!Number.isNaN(date.getTime())) {
        logDateDebug('parse-manual', { value: trimmed, iso: date.toISOString() })
        return date
      }
    }

    const timestamp = Number(trimmed)
    if (!Number.isNaN(timestamp)) {
      date = new Date(timestamp)
      if (!Number.isNaN(date.getTime())) {
        logDateDebug('parse-timestamp', { value: trimmed, iso: date.toISOString() })
        return date
      }
    }

    logDateDebug('parse-failed', { value })
    return null
  }

  const formatDate = (dateString: string | number | null | undefined) => {
    const date = parseDate(dateString)
    if (!date) {
      logDateDebug('format-fallback', { input: dateString })
      if (typeof dateString === 'string' && dateString.trim()) {
        return dateString
      }
      return ''
    }

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    if (diffMs < 0) {
      return formatAbsoluteDate(date)
    }

    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)

    let result: string
    if (diffSeconds < 5) result = '방금 전'
    else if (diffSeconds < 60) result = `${diffSeconds}초 전`
    else if (diffMinutes < 60) result = `${diffMinutes}분 전`
    else if (diffHours < 24) result = `${diffHours}시간 전`
    else result = formatAbsoluteDate(date)

    logDateDebug('format-success', { input: dateString, result })
    return result
  }

  const formatAbsoluteDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatPostTimestamp = (post: Post) => {
    const raw = post.createdAt ?? (post as any).created_at ?? null

    if (raw === null || raw === undefined || raw === '') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[community:date] post timestamp missing', {
          postId: post.postId,
          createdAt: post.createdAt,
          created_at: (post as any).created_at
        })
      }
      return '날짜 정보 없음'
    }

    const formatted = formatDate(raw)
    if (!formatted) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[community:date] post format failure', {
          postId: post.postId,
          raw
        })
      }
      return raw
    }

    return formatted
  }

  const formatWeightValue = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') return null
    const numeric = typeof value === 'string' ? parseFloat(value) : value
    if (!Number.isFinite(numeric)) return null
    return Number.isInteger(numeric) ? numeric.toString() : numeric.toFixed(1).replace(/\.0$/, '')
  }

  const buildBodySpecLabel = (post: Post) => {
    const height = post.authorHeightCm
    const weightLabel = formatWeightValue(post.authorWeightKg)
    const hasHeight = typeof height === 'number' && Number.isFinite(height)
    if (!hasHeight && !weightLabel) return null

    const parts: string[] = []
    if (hasHeight) {
      parts.push(`키 ${height}cm`)
    }
    if (weightLabel) {
      parts.push(`몸무게 ${weightLabel}kg`)
    }
    return parts.join(' · ')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-1 h-8 w-8">
          ←
        </Button>
        <div className="font-bold text-lg">커뮤니티</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleProfileClick}>
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
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
        
        {posts.map((post, index) => {
          const isOwner = isCurrentUserPostAuthor({ authorId: post.authorId, authorName: post.authorName })
          const isAnonymousAuthor = post.authorId === 'anonymous'

          return (
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
                  <button 
                    onClick={() => {
                      if (post.authorId && post.authorId !== 'anonymous') {
                        router.push(`/profile/${post.authorId}`)
                      }
                    }}
                    className="text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors"
                    disabled={!post.authorId || post.authorId === 'anonymous'}
                  >
                    <div className="font-medium">{post.authorName}</div>
                    {(() => {
                      const specLabel = buildBodySpecLabel(post)
                      return specLabel ? (
                        <div className="text-sm text-gray-500">{specLabel}</div>
                      ) : null
                    })()}
                  </button>
                </div>
                {isOwner ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditPost(post.postId)
                      }}
                    >
                      수정
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePost(post.postId, false)
                      }}
                      disabled={isDeleting}
                      data-testid="delete-post-button"
                    >
                      {isDeleting ? '삭제 중...' : '삭제'}
                    </Button>
                  </div>
                ) : isAnonymousAuthor ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditPost(post.postId)
                      }}
                    >
                      수정
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePost(post.postId, true)
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? '삭제 중...' : '삭제'}
                    </Button>
                  </div>
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

            {/* Post Title */}
            {post.title && (
              <div className="px-4 py-3 border-b">
                <h1 className="text-lg font-semibold text-light-text dark:text-gray-100">
                  {post.title}
                </h1>
              </div>
            )}

            {/* Main Image */}
            <div className="relative">
              {post.codyData && post.codyData.items && post.codyData.items.length > 0 ? (
                <div className="space-y-4">
                  {/* 코디 이미지 */}
                  <img
                    src={post.mediaUrls?.[0] || "/placeholder.svg"}
                    alt={post.title || post.content.substring(0, 20)}
                    className="w-full h-auto"
                  />
                  
                  {/* 코디 상품 정보 */}
                  <div className="px-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      사용된 상품
                    </h4>
                    <CodyProductList
                      items={post.codyData.items.map(item => ({
                        id: (item.productId ?? '').toString(),
                        itemId: (item.productId ?? '').toString(),
                        productId: item.productId,
                        name: (item as any).name || '',
                        src: item.src,
                        slot: ((item as any).slot as any) || 'accessory',
                        nx: item.nx,
                        ny: item.ny,
                        rotation: item.rotation,
                        z: item.z,
                        scale: item.scale,
                        visible: true,
                        anchor: 'center' as const,
                        stateVersion: 1
                      }) as any)}
                      showScrollButtons={true}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={post.mediaUrls?.[0] || "/placeholder.svg"}
                  alt={post.title || post.content.substring(0, 20)}
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
                <LikeButton
                  targetIdx={post.postId}
                  targetType="post"
                  initialActive={post.liked || false}
                  initialCount={post.likeCount}
                  className="p-2"
                />
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
                <span className="ml-auto text-xs text-gray-500">
                  {formatPostTimestamp(post)}
                </span>
                <div className="ml-auto">
                  <ScrapButton
                    postId={post.postId}
                    initialActive={post.scraped || false}
                    initialCount={post.scrapCount}
                    className="p-2"
                  />
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
                          <CommentLikeButton
                            commentId={mostPopularComment.commentId}
                            initialActive={mostPopularComment.liked || mostPopularComment.isLiked || false}
                            initialCount={mostPopularComment.likes || mostPopularComment.likeCount || 0}
                            className="p-1 h-6"
                          />
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
        )})}
        
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
        comments={(() => {
          const comments = selectedPostId ? (commentsByPost[selectedPostId] || []) : []
          // 댓글 모달에 전달되는 댓글
          return comments
        })()}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onReplyComment={handleReplyComment}
        formatDate={formatDate}
      />
    </div>
  )
}
