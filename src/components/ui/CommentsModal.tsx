"use client"

import { useState, useEffect } from "react"
import { X, Heart, Reply, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { CommentLikeButton } from "@/features/reactions/CommentLikeButton"

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

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  onAddComment: (content: string) => void
  onLikeComment: (commentId: number) => void
  onReplyComment: (commentId: number, content: string) => void
  formatDate: (dateString: string) => string
}

export function CommentsModal({
  isOpen,
  onClose,
  comments,
  onAddComment,
  onLikeComment,
  onReplyComment,
  formatDate
}: CommentsModalProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")

  // 댓글을 시간순으로 유지 (백엔드에서 이미 정렬됨)
  const sortedComments = comments

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment("")
    }
  }

  const handleReply = (commentId: number) => {
    if (replyContent.trim()) {
      onReplyComment(commentId, replyContent.trim())
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      action()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full h-[80vh] rounded-t-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">댓글 {comments.length}개</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sortedComments.map((comment) => (
            <div key={comment.commentId} className="space-y-3">
              {/* Main Comment */}
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.authorImage || comment.authorProfileImage} />
                  <AvatarFallback>{(comment.author || comment.authorName).charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.author || comment.authorName}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.date || comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <CommentLikeButton
                      commentId={comment.commentId}
                      initialActive={comment.liked || comment.isLiked || false}
                      initialCount={comment.likes || comment.likeCount || 0}
                      className="p-1 h-6"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 h-6"
                      onClick={() => setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId)}
                    >
                      <Reply className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-gray-500">답글</span>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment.commentId && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        placeholder="답글을 입력하세요..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, () => handleReply(comment.commentId))}
                        className="flex-1 text-sm"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleReply(comment.commentId)}
                        disabled={!replyContent.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-4 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.commentId} className="flex gap-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={reply.authorImage || reply.authorProfileImage} />
                            <AvatarFallback>{(reply.author || reply.authorName).charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs">{reply.author || reply.authorName}</span>
                              <span className="text-xs text-gray-500">{formatDate(reply.date || reply.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-900 mb-2">{reply.content}</p>
                            <div className="flex items-center gap-4">
                              <CommentLikeButton
                                commentId={reply.commentId}
                                initialActive={reply.liked || reply.isLiked || false}
                                initialCount={reply.likes || reply.likeCount || 0}
                                className="p-1 h-5"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleSubmitComment)}
              className="flex-1"
            />
            <Button 
              onClick={handleSubmitComment} 
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
