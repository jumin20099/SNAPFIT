"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User, Calendar, Lock, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react'
import { apiClient } from '@/shared/api/client'
import { formatCurrencyKRW } from '@/lib/utils'

interface Inquiry {
  inquiryId: number
  productId: number
  userId: string
  userNickname: string
  userProfileImage?: string
  title: string
  content: string
  isPrivate: boolean
  status: string
  answer?: string
  answeredBy?: string
  answeredByNickname?: string
  answeredAt?: string
  createdAt: string
  updatedAt: string
  canBeAnswered: boolean
}

interface InquirySectionProps {
  productId: string
  productName: string
  productPrice: number
  productImage: string
}

export default function InquirySection({ 
  productId, 
  productName, 
  productPrice, 
  productImage 
}: InquirySectionProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showWriteForm, setShowWriteForm] = useState(false)
  const [showAnswerForm, setShowAnswerForm] = useState<number | null>(null)
  const [newInquiry, setNewInquiry] = useState({
    title: '',
    content: '',
    isPrivate: false
  })
  const [newAnswer, setNewAnswer] = useState('')

  // 문의 목록 조회
  const fetchInquiries = async (reset = false) => {
    try {
      setLoading(true)
      const currentPage = reset ? 0 : page
      const data = await apiClient.getInquiries(Number(productId), currentPage, 10)
      const newInquiries = data.content || []
      
      if (reset) {
        setInquiries(newInquiries)
      } else {
        setInquiries(prev => [...prev, ...newInquiries])
      }
      
      setHasMore(!data.last)
      setPage(currentPage + 1)
    } catch (error) {
      console.error('문의 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 문의 작성
  const handleSubmitInquiry = async () => {
    if (!newInquiry.title.trim() || !newInquiry.content.trim()) return

    try {
      await apiClient.createInquiry(Number(productId), newInquiry)

      setNewInquiry({ title: '', content: '', isPrivate: false })
      setShowWriteForm(false)
      fetchInquiries(true) // 문의 목록 새로고침
    } catch (error) {
      console.error('문의 작성 실패:', error)
      alert('문의 작성에 실패했습니다.')
    }
  }

  // 문의 답변
  const handleSubmitAnswer = async (inquiryId: number) => {
    if (!newAnswer.trim()) return

    try {
      await apiClient.answerInquiry(Number(productId), inquiryId, newAnswer)

      setNewAnswer('')
      setShowAnswerForm(null)
      fetchInquiries(true) // 문의 목록 새로고침
    } catch (error) {
      console.error('답변 작성 실패:', error)
      alert('답변 작성에 실패했습니다.')
    }
  }

  // 문의 삭제
  const handleDeleteInquiry = async (inquiryId: number) => {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return

    try {
      await apiClient.deleteInquiry(Number(productId), inquiryId)
      fetchInquiries(true) // 문의 목록 새로고침
      alert('문의가 삭제되었습니다.')
    } catch (error) {
      console.error('문의 삭제 실패:', error)
      alert('문의 삭제에 실패했습니다.')
    }
  }

  useEffect(() => {
    fetchInquiries(true)
  }, [productId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'ANSWERED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'CLOSED':
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '답변 대기'
      case 'ANSWERED':
        return '답변 완료'
      case 'CLOSED':
        return '문의 종료'
      default:
        return '알 수 없음'
    }
  }

  return (
    <div className="space-y-6">
      {/* 문의 작성 버튼 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <Button 
          onClick={() => setShowWriteForm(!showWriteForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          문의 작성하기
        </Button>
      </div>

      {/* 문의 작성 폼 */}
      {showWriteForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">문의 작성</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">문의 제목</Label>
              <Input
                id="title"
                value={newInquiry.title}
                onChange={(e) => setNewInquiry(prev => ({ ...prev, title: e.target.value }))}
                placeholder="문의 제목을 입력해주세요"
                maxLength={255}
              />
            </div>
            <div>
              <Label htmlFor="content">문의 내용</Label>
              <Textarea
                id="content"
                value={newInquiry.content}
                onChange={(e) => setNewInquiry(prev => ({ ...prev, content: e.target.value }))}
                placeholder="문의 내용을 자세히 작성해주세요"
                rows={4}
                maxLength={2000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {newInquiry.content.length}/2000
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPrivate"
                checked={newInquiry.isPrivate}
                onCheckedChange={(checked) => setNewInquiry(prev => ({ ...prev, isPrivate: checked }))}
              />
              <Label htmlFor="isPrivate" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                비공개 문의 (관리자와 작성자만 볼 수 있습니다)
              </Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitInquiry} className="bg-blue-600 hover:bg-blue-700">
                문의 등록
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowWriteForm(false)}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 문의 목록 */}
      <div className="space-y-4">
        {inquiries.map((inquiry) => (
          <div key={inquiry.inquiryId} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {inquiry.userProfileImage ? (
                    <img
                      src={inquiry.userProfileImage}
                      alt={inquiry.userNickname}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {inquiry.userNickname}
                    {inquiry.isPrivate && <Lock className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(inquiry.status)}
                      {getStatusText(inquiry.status)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {inquiry.canBeAnswered && inquiry.status === 'OPEN' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnswerForm(
                      showAnswerForm === inquiry.inquiryId ? null : inquiry.inquiryId
                    )}
                  >
                    답변하기
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteInquiry(inquiry.inquiryId)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-lg mb-2">{inquiry.title}</h4>
              <p className="text-gray-800 whitespace-pre-wrap">{inquiry.content}</p>
            </div>

            {/* 답변 */}
            {inquiry.answer && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    {inquiry.answeredByNickname || '관리자'} 답변
                  </span>
                  {inquiry.answeredAt && (
                    <span className="text-sm text-blue-600">
                      ({new Date(inquiry.answeredAt).toLocaleDateString()})
                    </span>
                  )}
                </div>
                <p className="text-blue-800 whitespace-pre-wrap">{inquiry.answer}</p>
              </div>
            )}

            {/* 답변 작성 폼 */}
            {showAnswerForm === inquiry.inquiryId && (
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <Label htmlFor={`answer-${inquiry.inquiryId}`}>답변 작성</Label>
                  <Textarea
                    id={`answer-${inquiry.inquiryId}`}
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="답변을 작성해주세요"
                    rows={3}
                    maxLength={2000}
                  />
                  <div className="text-right text-sm text-gray-500">
                    {newAnswer.length}/2000
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSubmitAnswer(inquiry.inquiryId)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      답변 등록
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAnswerForm(null)}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">문의를 불러오는 중...</div>
          </div>
        )}

        {!loading && inquiries.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">아직 작성된 문의가 없습니다.</div>
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => fetchInquiries(false)}
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
