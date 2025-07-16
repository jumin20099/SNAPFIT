"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, Send, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Comment {
  id: number
  author: string
  authorImage: string
  content: string
  date: string
  likes: number
  liked?: boolean
  replies?: Comment[]
}

interface PostDetailProps {
  isOpen: boolean
  onClose: () => void
  postId: number
}

export default function PostDetailPage({ isOpen, onClose, postId = 1 }: PostDetailProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "related">("comments")
  const [commentText, setCommentText] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isScraped, setIsScraped] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])

  // 게시글 데이터는 반드시 API에서 받아와야 함
  const post: any = undefined;

  if (!isOpen || !post) return null;

  const relatedPosts = [
    {
      id: 8,
      title: "2024 여름 트렌드: 컬러풀한 미니멀리즘의 시대",
      thumbnail: "/placeholder.svg?height=80&width=80",
      author: "color_expert",
      comments: 45,
      likes: 213,
    },
    {
      id: 9,
      title: "패션 위크에서 발견한 내년 봄 트렌드 미리보기",
      thumbnail: "/placeholder.svg?height=80&width=80",
      author: "trend_hunter",
      comments: 32,
      likes: 178,
    },
    {
      id: 10,
      title: "스트리트 패션의 진화: 2024년 달라진 점",
      thumbnail: "/placeholder.svg?height=80&width=80",
      author: "street_style",
      comments: 56,
      likes: 267,
    },
  ]

  const toggleLike = () => {
    setIsLiked(!isLiked)
  }

  const toggleScrap = () => {
    setIsScraped(!isScraped)
  }

  const toggleCommentLike = (commentId: number) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            liked: !comment.liked,
          }
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: reply.liked ? reply.likes - 1 : reply.likes + 1,
                  liked: !reply.liked,
                }
              }
              return reply
            }),
          }
        }
        return comment
      }),
    )
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newComment = {
      id: comments.length + 1,
      author: "current_user",
      authorImage: "/placeholder.svg?height=40&width=40",
      content: commentText,
      date: "방금 전",
      likes: 0,
      liked: false,
    }

    setComments([newComment, ...comments])
    setCommentText("")
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="font-medium text-base line-clamp-1">{post?.title}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-16">
        {/* 작성자 정보 */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post?.authorImage || "/placeholder.svg"} alt={post?.author} />
              <AvatarFallback>{post?.author.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post?.author}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{post?.date}</span>
                <span>•</span>
                <span>{post?.readTime} 읽기</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            팔로우
          </Button>
        </div>

        {/* 태그 */}
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {post?.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* 게시글 제목 */}
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold">{post?.title}</h1>
        </div>

        {/* 이미지 갤러리 */}
        <div className="mb-4 overflow-x-auto whitespace-nowrap px-4 pb-2">
          <div className="flex gap-2">
            {post?.images.map((image: string, index: number) => (
              <div key={index} className="w-72 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`게시글 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="px-4 pb-4">
          <div
            className={`prose prose-sm max-w-none ${!showFullContent && "line-clamp-10"}`}
            dangerouslySetInnerHTML={{
              __html: post?.content.replace(/\n\n## /g, "<h2>").replace(/\n\n/g, "</p><p>"),
            }}
          />
          {!showFullContent && (
            <Button variant="ghost" onClick={() => setShowFullContent(true)} className="text-blue-600 p-0 h-auto mt-2">
              더 보기
            </Button>
          )}
        </div>

        {/* 통계 및 액션 */}
        <div className="px-4 py-3 border-t border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <Eye className="w-4 h-4 text-gray-500" />
              <span>{post?.views}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span>{post?.comments}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLike}
              className={`flex items-center gap-1 ${isLiked ? "text-red-500" : "text-gray-500"}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`} />
              <span>{isLiked ? post?.likes + 1 : post?.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleScrap}
              className={`flex items-center gap-1 ${isScraped ? "text-blue-500" : "text-gray-500"}`}
            >
              <Bookmark className={`w-5 h-5 ${isScraped ? "fill-blue-500" : ""}`} />
              <span>{isScraped ? post?.scraps + 1 : post?.scraps}</span>
            </Button>
          </div>
        </div>

        {/* 탭 (댓글/관련글) */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "comments" | "related")}>
          <div className="border-b">
            <TabsList className="w-full grid grid-cols-2 bg-transparent h-12 p-0">
              <TabsTrigger
                value="comments"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
              >
                댓글 {post?.comments}
              </TabsTrigger>
              <TabsTrigger
                value="related"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
              >
                관련글
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="comments" className="m-0">
            {/* 댓글 작성 */}
            <div className="p-4 border-b">
              <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Your Avatar" />
                  <AvatarFallback>YO</AvatarFallback>
                </Avatar>
                <Input
                  placeholder="댓글을 남겨보세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" variant="ghost" disabled={!commentText.trim()}>
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>

            {/* 댓글 목록 */}
            <div>
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 border-b">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.authorImage || "/placeholder.svg"} alt={comment.author} />
                      <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{comment.author}</div>
                        <div className="text-xs text-gray-500">{comment.date}</div>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCommentLike(comment.id)}
                          className={`p-0 h-auto text-xs flex items-center gap-1 ${
                            comment.liked ? "text-red-500" : "text-gray-500"
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${comment.liked ? "fill-red-500" : ""}`} />
                          <span>{comment.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-gray-500">
                          답글
                        </Button>
                      </div>

                      {/* 답글 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-100">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="mb-2">
                              <div className="flex gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={reply.authorImage || "/placeholder.svg"} alt={reply.author} />
                                  <AvatarFallback>{reply.author.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium text-xs">{reply.author}</div>
                                    <div className="text-xs text-gray-500">{reply.date}</div>
                                  </div>
                                  <p className="text-xs mt-1">{reply.content}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleCommentLike(reply.id)}
                                      className={`p-0 h-auto text-xs flex items-center gap-1 ${
                                        reply.liked ? "text-red-500" : "text-gray-500"
                                      }`}
                                    >
                                      <Heart className={`w-3 h-3 ${reply.liked ? "fill-red-500" : ""}`} />
                                      <span>{reply.likes}</span>
                                    </Button>
                                  </div>
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
          </TabsContent>

          <TabsContent value="related" className="m-0">
            <div className="p-4">
              <h3 className="font-medium mb-3">관련 게시글</h3>
              <div className="space-y-4">
                {relatedPosts.map((post) => (
                  <div key={post.id} className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded">
                      <img
                        src={post.thumbnail || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{post.author}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
