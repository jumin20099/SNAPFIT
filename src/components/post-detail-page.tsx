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
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "style_lover",
      authorImage: "/placeholder.svg?height=40&width=40",
      content: "정말 유익한 정보 감사합니다! 저도 가을 코디 준비하고 있었는데 많은 도움이 되었어요.",
      date: "2시간 전",
      likes: 24,
      liked: false,
    },
    {
      id: 2,
      author: "fashion_critic",
      authorImage: "/placeholder.svg?height=40&width=40",
      content:
        "오버사이즈 코트는 작년부터 계속 인기였는데, 올해는 어깨 라인이 더 강조된 것 같아요. 그리고 레트로 컬러 중에서도 특히 버건디와 머스타드가 돋보이는 것 같습니다.",
      date: "1시간 전",
      likes: 15,
      liked: false,
      replies: [
        {
          id: 21,
          author: "fashion_analyst",
          authorImage: "/placeholder.svg?height=40&width=40",
          content: "맞아요! 특히 버건디는 가을에 정말 잘 어울리는 컬러죠. 좋은 의견 감사합니다.",
          date: "30분 전",
          likes: 8,
          liked: false,
        },
      ],
    },
    {
      id: 3,
      author: "minimal_style",
      authorImage: "/placeholder.svg?height=40&width=40",
      content: "미니멀한 스타일을 좋아하는데, 이번 트렌드에서도 미니멀 요소를 적용할 수 있을까요?",
      date: "45분 전",
      likes: 7,
      liked: false,
    },
  ])

  // 예시 게시글 데이터
  const post = {
    id: 1,
    title: "2024 가을/겨울 트렌드 완벽 분석: 꼭 알아야 할 5가지 스타일",
    content: `올해 가을겨울 시즌의 핵심 트렌드를 분석해보았습니다. 패션 위크에서 발견한 트렌드들을 실제 코디에 어떻게 적용할 수 있는지 상세히 알아보세요.

## 1. 오버사이즈 실루엣의 귀환

올 시즌에는 오버사이즈 실루엣이 다시 한번 강세를 보이고 있습니다. 특히 코트와 니트웨어에서 두드러지게 나타나는데, 과하게 큰 사이즈보다는 어깨 라인이 살짝 강조된 세미 오버사이즈가 트렌드입니다.

## 2. 레트로 컬러 팔레트

70년대와 90년대에서 영감을 받은 컬러 팔레트가 돌아왔습니다. 버건디, 머스타드, 올리브 그린 등의 빈티지한 색상이 현대적으로 재해석되어 선보여지고 있어요.

## 3. 텍스처 믹스 매치

다양한 텍스처를 레이어링하는 것이 이번 시즌의 핵심 스타일링 방법입니다. 니트, 가죽, 실크, 데님 등 서로 다른 소재감을 조화롭게 매치해보세요.

## 4. 스테이트먼트 액세서리

미니멀한 의상에 포인트를 주는 스테이트먼트 액세서리가 주목받고 있습니다. 특히 청키한 체인 목걸이와 오버사이즈 이어링이 인기를 끌고 있어요.

## 5. 지속가능한 패션

환경을 생각하는 지속가능한 패션이 단순한 트렌드를 넘어 필수 요소로 자리잡고 있습니다. 재활용 소재를 활용한 제품과 윤리적 생산 과정을 거친 브랜드들이 주목받고 있어요.

한국 브랜드들은 이러한 글로벌 트렌드를 어떻게 해석하고 있을까요? 특히 K-패션은 레트로 컬러를 현대적으로 재해석하는 데 탁월한 모습을 보여주고 있습니다. 또한 한국 특유의 레이어링 기술로 텍스처 믹스 매치를 더욱 세련되게 표현하고 있죠.

다음 포스팅에서는 이러한 트렌드를 실제 일상 코디에 적용하는 구체적인 방법에 대해 더 자세히 알아보도록 하겠습니다. 여러분의 의견도 댓글로 남겨주세요!`,
    author: "fashion_analyst",
    authorImage: "/placeholder.svg?height=40&width=40",
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    date: "2024년 5월 19일",
    readTime: "8분",
    views: 1245,
    likes: 342,
    comments: 67,
    scraps: 89,
    tags: ["트렌드", "가을패션", "스타일링", "2024FW", "패션위크"],
  }

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="font-medium text-base line-clamp-1">{post.title}</div>
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
              <AvatarImage src={post.authorImage || "/placeholder.svg"} alt={post.author} />
              <AvatarFallback>{post.author.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.author}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime} 읽기</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            팔로우
          </Button>
        </div>

        {/* 태그 */}
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* 게시글 제목 */}
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold">{post.title}</h1>
        </div>

        {/* 이미지 갤러리 */}
        <div className="mb-4 overflow-x-auto whitespace-nowrap px-4 pb-2">
          <div className="flex gap-2">
            {post.images.map((image, index) => (
              <div key={index} className="w-72 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={image || "/placeholder.svg"}
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
              __html: post.content.replace(/\n\n## /g, "<h2>").replace(/\n\n/g, "</p><p>"),
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
              <span>{post.views}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span>{post.comments}</span>
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
              <span>{isLiked ? post.likes + 1 : post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleScrap}
              className={`flex items-center gap-1 ${isScraped ? "text-blue-500" : "text-gray-500"}`}
            >
              <Bookmark className={`w-5 h-5 ${isScraped ? "fill-blue-500" : ""}`} />
              <span>{isScraped ? post.scraps + 1 : post.scraps}</span>
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
                댓글 {post.comments}
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
