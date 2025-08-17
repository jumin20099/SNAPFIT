"use client"
import { useState, useEffect } from 'react'

interface FollowingPost {
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
}

export function useFollowingPosts() {
  const [posts, setPosts] = useState<FollowingPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFollowingPosts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('로그인이 필요합니다')
        return
      }

      const response = await fetch('http://localhost:8080/api/posts/following', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const postsData = data.content || []
        
        const transformedPosts = postsData.map((post: any) => ({
          postId: post.postId,
          title: post.title || "",
          content: post.content,
          authorName: post.authorName || "익명",
          authorProfileImage: post.authorProfileImage || "/file.svg",
          mediaUrls: post.mediaUrls || [],
          likeCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          scrapCount: post.scrapCount || 0,
          createdAt: post.createdAt,
          tags: post.tags || [],
          liked: post.isLiked || false,
          scraped: post.isScrapped || false,
        }))
        
        setPosts(transformedPosts)
      } else {
        setError('팔로잉 게시글을 불러올 수 없습니다')
      }
    } catch (error) {
      console.error('팔로잉 게시글 로드 중 오류:', error)
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollowingPosts()
  }, [])

  const refresh = () => {
    fetchFollowingPosts()
  }

  return {
    posts,
    loading,
    error,
    refresh,
  }
}
