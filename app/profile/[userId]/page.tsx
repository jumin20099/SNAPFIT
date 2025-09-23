'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'

interface ProfileData {
  userId: string
  nickname: string
  profileImage: string
  bio: string
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isOwnProfile: boolean
  posts: PostSummary[]
}

interface PostSummary {
  postId: number
  title: string
  content: string
  thumbnailImage: string
  likeCount: number
  commentCount: number
  scrapCount: number
  createdAt: string
}

interface Outfit {
  outfitIdx: number
  outfitName: string
  outfitThumbnail?: string
  outfitItem: any
  isPublic: boolean
  createdAt: string
  user: {
    userIdx: string
    nickname: string
    profileImage?: string
  }
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [outfitsLoading, setOutfitsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'outfits'>('posts')

  useEffect(() => {
    fetchProfile()
    fetchOutfits()
  }, [userId])

  const fetchOutfits = async () => {
    try {
      setOutfitsLoading(true)
      const data = await apiClient.getUserOutfits(userId, 0, 20)
      setOutfits(data || [])
    } catch (error) {
      console.error('코디 조회 실패:', error)
    } finally {
      setOutfitsLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/profiles/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFollowing(data.isFollowing)
      } else {
        console.error('프로필 조회 실패')
      }
    } catch (error) {
      console.error('프로필 조회 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!profile) return

    try {
      const token = localStorage.getItem('token')
      const endpoint = following ? `/api/profiles/${userId}/unfollow` : `/api/profiles/${userId}/follow`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setFollowing(!following)
        setProfile(prev => prev ? {
          ...prev,
          followerCount: following ? prev.followerCount - 1 : prev.followerCount + 1
        } : null)
      }
    } catch (error) {
      console.error('팔로우 처리 중 오류:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">프로필을 찾을 수 없습니다.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">프로필</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 프로필 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <Image
                src={profile.profileImage || '/placeholder.svg'}
                alt={profile.nickname}
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.nickname}
                </h2>
                
                <div className="flex space-x-3">
                  {profile.isOwnProfile ? (
                    <Link
                      href={`/profile/${userId}/edit`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      프로필 수정
                    </Link>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        following 
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {following ? '팔로잉' : '팔로우'}
                    </button>
                  )}
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}

              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.followerCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">팔로워</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.followingCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">팔로잉</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              작성한 글 ({profile.posts.length})
            </button>
            <button
              onClick={() => setActiveTab('outfits')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'outfits'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              코디 ({outfits.length})
            </button>
          </div>
        </div>

        {/* 작성한 글 */}
        {activeTab === 'posts' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                작성한 글 ({profile.posts.length})
              </h3>
            </div>
          
          {profile.posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              아직 작성한 글이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {profile.posts.map((post) => (
                <Link
                  key={post.postId}
                  href={`/community/${post.postId}`}
                  className="group block bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {post.thumbnailImage && (
                    <div className="aspect-square relative">
                      <Image
                        src={post.thumbnailImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex space-x-3">
                        <span>좋아요 {post.likeCount}</span>
                        <span>댓글 {post.commentCount}</span>
                        <span>스크랩 {post.scrapCount}</span>
                      </div>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          </div>
        )}

        {/* 코디 섹션 */}
        {activeTab === 'outfits' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                코디 ({outfits.length})
              </h3>
            </div>
            
            {outfitsLoading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">코디를 불러오는 중...</p>
              </div>
            ) : outfits.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👗</span>
                </div>
                <p>아직 공개된 코디가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {outfits.map((outfit) => (
                  <div
                    key={outfit.outfitIdx}
                    className="group block bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {outfit.outfitThumbnail ? (
                      <div className="aspect-[9/16] relative bg-white dark:bg-gray-900">
                        <Image
                          src={outfit.outfitThumbnail}
                          alt={outfit.outfitName}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[9/16] bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500 text-sm">이미지 없음</span>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {outfit.outfitName}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(outfit.createdAt).toLocaleDateString()}</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                          공개
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
