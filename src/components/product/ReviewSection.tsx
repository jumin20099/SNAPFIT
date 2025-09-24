"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Star, ThumbsUp, Flag, User, Calendar } from 'lucide-react'
import { formatCurrencyKRW } from '@/lib/utils'
import { apiClient } from '@/shared/api/client'

interface Review {
  reviewId: number
  productId: number
  userId: string
  userNickname: string
  userProfileImage?: string
  rating: number
  content: string
  images?: string[]
  helpfulCount: number
  isReported: boolean
  status: string
  createdAt: string
  updatedAt: string
  isHelpfulByUser: boolean
  userHeightCm?: number | null
  userWeightKg?: number | string | null
}

interface ReviewSectionProps {
  productId: string
  productName: string
  productPrice: number
  productImage: string
  ratingAvg: number
  reviewCount: number
}

export default function ReviewSection({ 
  productId, 
  productName, 
  productPrice, 
  productImage, 
  ratingAvg, 
  reviewCount 
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showWriteForm, setShowWriteForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [newReview, setNewReview] = useState({
    rating: 5,
    content: '',
    images: [] as string[]
  })

  // 리뷰 목록 조회
  const fetchReviews = async (reset = false) => {
    try {
      setLoading(true)
      const currentPage = reset ? 0 : page
      const data = await apiClient.getReviews(productId, currentPage, 10)
      const newReviews = data.content || []
      
      if (reset) {
        setReviews(newReviews)
      } else {
        setReviews(prev => [...prev, ...newReviews])
      }
      
      setHasMore(!data.last)
      setPage(currentPage + 1)
    } catch (error) {
      console.error('리뷰 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 리뷰 작성/수정
  const handleSubmitReview = async () => {
    if (!newReview.content.trim()) return

    try {
      if (editingReview) {
        // 리뷰 수정
        await apiClient.updateReview(productId, editingReview.reviewId, newReview)
        alert('리뷰가 수정되었습니다.')
      } else {
        // 리뷰 작성
        await apiClient.createReview(productId, newReview)
        alert('리뷰가 작성되었습니다.')
      }

      setNewReview({ rating: 5, content: '', images: [] })
      setEditingReview(null)
      setShowWriteForm(false)
      fetchReviews(true) // 리뷰 목록 새로고침
    } catch (error) {
      console.error('리뷰 처리 실패:', error)
      alert(editingReview ? '리뷰 수정에 실패했습니다.' : '리뷰 작성에 실패했습니다.')
    }
  }

  // 도움됨 토글
  const handleToggleHelpful = async (reviewId: number) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      
      const response = await fetch(
        `${API_BASE_URL}/api/products/${productId}/reviews/${reviewId}/helpful`,
        { 
          method: 'POST',
          credentials: 'include'
        }
      )

      if (response.ok) {
        fetchReviews(true) // 리뷰 목록 새로고침
      }
    } catch (error) {
      console.error('도움됨 토글 실패:', error)
    }
  }

  // 리뷰 신고
  const handleReportReview = async (reviewId: number) => {
    if (!confirm('이 리뷰를 신고하시겠습니까?')) return

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      
      const response = await fetch(
        `${API_BASE_URL}/api/products/${productId}/reviews/${reviewId}/report`,
        { 
          method: 'POST',
          credentials: 'include'
        }
      )

      if (response.ok) {
        alert('신고가 접수되었습니다.')
      }
    } catch (error) {
      console.error('리뷰 신고 실패:', error)
    }
  }

  // 리뷰 수정
  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setNewReview({
      rating: review.rating,
      content: review.content,
      images: review.images || []
    })
    setShowWriteForm(true)
  }

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('이 리뷰를 삭제하시겠습니까?')) return

    try {
      await apiClient.deleteReview(productId, reviewId)
      fetchReviews(true) // 리뷰 목록 새로고침
      alert('리뷰가 삭제되었습니다.')
    } catch (error) {
      console.error('리뷰 삭제 실패:', error)
      alert('리뷰 삭제에 실패했습니다.')
    }
  }

  useEffect(() => {
    fetchReviews(true)
  }, [productId, sortBy])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatWeightValue = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') return null
    const numeric = typeof value === 'string' ? parseFloat(value) : value
    if (!Number.isFinite(numeric)) return null
    return Number.isInteger(numeric) ? numeric.toString() : numeric.toFixed(1).replace(/\.0$/, '')
  }

  const buildBodySpecLabel = (review: Review) => {
    const height = review.userHeightCm
    const weightLabel = formatWeightValue(review.userWeightKg)
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
    <div className="space-y-6">
      {/* 리뷰 통계 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex">
              {renderStars(Math.round(ratingAvg))}
            </div>
            <span className="text-2xl font-bold">{ratingAvg.toFixed(1)}</span>
            <span className="text-gray-500">({reviewCount}개 리뷰)</span>
          </div>
        </div>

        <Button 
          onClick={() => {
            setEditingReview(null)
            setNewReview({ rating: 5, content: '', images: [] })
            setShowWriteForm(!showWriteForm)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          리뷰 작성하기
        </Button>
      </div>

      {/* 리뷰 작성 폼 */}
      {showWriteForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editingReview ? '리뷰 수정' : '리뷰 작성'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">평점</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        i < newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">리뷰 내용</label>
              <Textarea
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                placeholder="상품에 대한 솔직한 리뷰를 작성해주세요"
                rows={4}
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {newReview.content.length}/1000
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} className="bg-blue-600 hover:bg-blue-700">
                {editingReview ? '수정 완료' : '리뷰 등록'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowWriteForm(false)
                  setEditingReview(null)
                  setNewReview({ rating: 5, content: '', images: [] })
                }}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 정렬 옵션 */}
      <div className="flex gap-2">
        <Button
          variant={sortBy === 'recent' ? 'default' : 'outline'}
          onClick={() => setSortBy('recent')}
          size="sm"
        >
          최신순
        </Button>
        <Button
          variant={sortBy === 'rating' ? 'default' : 'outline'}
          onClick={() => setSortBy('rating')}
          size="sm"
        >
          평점순
        </Button>
        <Button
          variant={sortBy === 'helpful' ? 'default' : 'outline'}
          onClick={() => setSortBy('helpful')}
          size="sm"
        >
          도움됨순
        </Button>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.reviewId} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {review.userProfileImage ? (
                    <img
                      src={review.userProfileImage}
                      alt={review.userNickname}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{review.userNickname}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {(() => {
                    const specLabel = buildBodySpecLabel(review)
                    return specLabel ? (
                      <div className="text-xs text-gray-500 mt-1">{specLabel}</div>
                    ) : null
                  })()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditReview(review)}
                  className="text-gray-400 hover:text-blue-500"
                >
                  수정
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteReview(review.reviewId)}
                  className="text-gray-400 hover:text-red-500"
                >
                  삭제
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReportReview(review.reviewId)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">{review.content}</p>
            </div>

            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-4">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`리뷰 이미지 ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleHelpful(review.reviewId)}
                className={`flex items-center gap-1 ${
                  review.isHelpfulByUser ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                도움됨 ({review.helpfulCount})
              </Button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">리뷰를 불러오는 중...</div>
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">아직 작성된 리뷰가 없습니다.</div>
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => fetchReviews(false)}
              className="w-full"
            >
              더 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
