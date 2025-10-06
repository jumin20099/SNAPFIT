"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Reply, MoreHorizontal, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useComments } from '@/hooks/useComments'
import { CommentLikeButton } from '@/features/reactions/CommentLikeButton'

interface CommentsSectionProps {
  postId: number
  boardType: 'QUESTION' | 'INFO'
}

interface Comment {
  commentId: number
  content: string
  authorName: string
  authorProfileImage: string
  parentId?: number
  likeCount: number
  isLiked: boolean  // 필수 필드로 변경
  createdAt: string
  updatedAt: string
  replies?: Comment[]
}

export function CommentsSection({ postId, boardType }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [commentPassword, setCommentPassword] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyPassword, setReplyPassword] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null)
  const [deletePassword, setDeletePassword] = useState('')

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return '-'
    }

    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')
    const seconds = `${date.getSeconds()}`.padStart(2, '0')

    return `${year}:${month}:${day}:${hours}:${minutes}:${seconds}`
  }

  // 댓글 목록 로드
  const loadComments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // 로그인한 사용자의 경우 Authorization 헤더 추가
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/comments/posts/${postId}?sortBy=time`, {
        method: 'GET',
        headers,
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('댓글 목록 로드 성공:', data)
        setComments(data)
      } else {
        toast.error('댓글을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('댓글 로드 실패:', error)
      toast.error('댓글을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    const token = localStorage.getItem('token')
    const isLoggedIn = !!token

    // 로그인하지 않은 사용자는 비밀번호 필수
    if (!isLoggedIn && (!commentPassword.trim() || commentPassword.trim().length < 4)) {
      toast.error('비밀번호는 4자 이상 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const requestBody: any = {
        postId: postId,
        content: newComment.trim()
      }

      // 익명 사용자인 경우 비밀번호 추가
      if (!isLoggedIn) {
        requestBody.anonymousPassword = commentPassword.trim()
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const newCommentData = await response.json()
        setComments(prev => [newCommentData, ...prev])
        setNewComment('')
        setCommentPassword('')
        toast.success('댓글이 작성되었습니다.')
      } else {
        const errorData = await response.json().catch(() => ({ error: '댓글 작성에 실패했습니다.' }))
        toast.error(errorData.error || '댓글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error)
      toast.error('댓글 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 대댓글 작성
  const handleReplyComment = async (parentId: number) => {
    if (!replyContent.trim()) return

    const token = localStorage.getItem('token')
    const isLoggedIn = !!token

    // 로그인하지 않은 사용자는 비밀번호 필수
    if (!isLoggedIn && (!replyPassword.trim() || replyPassword.trim().length < 4)) {
      toast.error('비밀번호는 4자 이상 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const requestBody: any = {
        postId: postId,
        content: replyContent.trim(),
        parentId: parentId
      }

      // 익명 사용자인 경우 비밀번호 추가
      if (!isLoggedIn) {
        requestBody.anonymousPassword = replyPassword.trim()
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const newReply = await response.json()
        // 대댓글을 해당 댓글의 replies에 추가
        setComments(prev => prev.map(comment => 
          comment.commentId === parentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        ))
        setReplyContent('')
        setReplyPassword('')
        setReplyingTo(null)
        toast.success('답글이 작성되었습니다.')
      } else {
        const errorData = await response.json().catch(() => ({ error: '답글 작성에 실패했습니다.' }))
        toast.error(errorData.error || '답글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('답글 작성 실패:', error)
      toast.error('답글 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }


  // 댓글 삭제 모달 열기
  const handleDeleteCommentClick = (commentId: number) => {
    setCommentToDelete(commentId)
    setDeleteModalOpen(true)
  }

  // 댓글 삭제 실행
  const handleDeleteComment = async () => {
    if (!commentToDelete) return

    const token = localStorage.getItem('token')
    const isLoggedIn = !!token

    // 익명 댓글인 경우 비밀번호 필수
    if (!isLoggedIn && !deletePassword.trim()) {
      toast.error('비밀번호를 입력해주세요.')
      return
    }

    try {
      const requestBody: any = {}
      if (!isLoggedIn) {
        requestBody.password = deletePassword.trim()
      }

      const response = await fetch(`/api/comments/${commentToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.commentId !== commentToDelete))
        toast.success('댓글이 삭제되었습니다.')
        setDeleteModalOpen(false)
        setCommentToDelete(null)
        setDeletePassword('')
      } else {
        if (response.status === 403) {
          toast.error('비밀번호가 올바르지 않습니다.')
        } else {
          toast.error('댓글 삭제에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error)
      toast.error('댓글 삭제에 실패했습니다.')
    }
  }

  useEffect(() => {
    loadComments()
  }, [postId])

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">댓글 {comments.length}개</h3>
      
      {/* 댓글 작성 */}
      <div className="mb-6">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="댓글을 작성해주세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleSubmitComment)}
              className="min-h-[80px] resize-none"
            />
            {!localStorage.getItem('token') && (
              <div className="mt-2">
                <input
                  type="password"
                  placeholder="비밀번호 (4자 이상)"
                  value={commentPassword}
                  onChange={(e) => setCommentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            )}
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                size="sm"
              >
                <Send className="w-4 h-4 mr-1" />
                {submitting ? '작성 중...' : '댓글 작성'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4 text-gray-500">댓글을 불러오는 중...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.commentId} className="space-y-3">
              {/* 메인 댓글 */}
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.authorProfileImage} />
                  <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <CommentLikeButton
                      commentId={comment.commentId}
                      initialActive={comment.isLiked || false}
                      initialCount={comment.likeCount || 0}
                      className="text-gray-500 hover:text-red-500"
                      onToggleSuccess={() => {
                        // 좋아요 토글 성공 후 댓글 목록 새로고침
                        loadComments()
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId)}
                      className="text-gray-500"
                    >
                      <Reply className="w-4 h-4 mr-1" />
                      답글
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCommentClick(comment.commentId)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 답글 작성 */}
              {replyingTo === comment.commentId && (
                <div className="ml-11">
                  <div className="flex gap-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="답글을 작성해주세요..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, () => handleReplyComment(comment.commentId))}
                        className="min-h-[60px] resize-none text-sm"
                      />
                      {!localStorage.getItem('token') && (
                        <div className="mt-2">
                          <input
                            type="password"
                            placeholder="비밀번호 (4자 이상)"
                            value={replyPassword}
                            onChange={(e) => setReplyPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                        >
                          취소
                        </Button>
                        <Button
                          onClick={() => handleReplyComment(comment.commentId)}
                          disabled={!replyContent.trim() || submitting}
                          size="sm"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          {submitting ? '작성 중...' : '답글 작성'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 대댓글 목록 */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.commentId} className="flex gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={reply.authorProfileImage} />
                        <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{reply.authorName}</span>
                            <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-800">{reply.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <CommentLikeButton
                            commentId={reply.commentId}
                            initialActive={reply.isLiked || false}
                            initialCount={reply.likeCount || 0}
                            className="text-gray-500 hover:text-red-500"
                            onToggleSuccess={() => {
                              // 좋아요 토글 성공 후 댓글 목록 새로고침
                              loadComments()
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCommentClick(reply.commentId)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 댓글 삭제 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">댓글 삭제</h3>
            <p className="text-gray-600 mb-4">댓글을 삭제하시겠습니까?</p>
            
            {!localStorage.getItem('token') && (
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setCommentToDelete(null)
                  setDeletePassword('')
                }}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteComment}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
