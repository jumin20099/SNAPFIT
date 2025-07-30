"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Bold, Italic, Underline, Strikethrough, ImageIcon, Palette, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PostCreatePageProps {
  isOpen: boolean
  onClose: () => void
}

interface UploadedImage {
  id: string
  url: string
}

export default function PostCreatePage({ isOpen, onClose }: PostCreatePageProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(true);
  const placeholder = "내용을 입력하세요...";

  // 에디터 초기화
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content
      editorRef.current.focus()
    }
  }, [])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  // 이미지 업로드 처리
  const handleImageUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          const newImage = {
            id: Date.now().toString(),
            url: imageUrl,
          }
          setUploadedImages((prev) => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleImageUpload(files)
    }
  }

  // 이미지 삭제
  const handleRemoveImage = (id: string) => {
    setUploadedImages(uploadedImages.filter((img) => img.id !== id))
  }

  // 텍스트 스타일 적용
  const applyTextStyle = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
      editorRef.current.focus()
    }
  }

  // 에디터 내용 변경 처리
  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setIsEmpty(e.currentTarget.textContent === "");
    handleEditorChange(); // 기존 함수도 호출
  };

  // 게시글 발행
  const handlePublish = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.")
      return
    }

    if (!content.trim() && uploadedImages.length === 0) {
      alert("내용을 입력하거나 이미지를 업로드해주세요.")
      return
    }

    // 여기서 실제 게시글 저장 로직 구현

    alert("게시글이 발행되었습니다!")
    onClose()
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
          <h1 className="text-xl font-bold">글 작성</h1>
        </div>
        <Button onClick={handlePublish} className="bg-blue-600 hover:bg-blue-700">
          발행
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* 제목 입력 */}
          <div>
            <Input
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-none p-0 focus-visible:ring-0 placeholder:text-gray-400"
            />
          </div>

          {/* 태그 입력 */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  #{tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="태그를 입력하고 Enter를 누르세요"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-sm"
            />
          </div>

          {/* 텍스트 포맷팅 툴바 */}
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* 폰트 크기 */}
                <select
                  onChange={(e) => applyTextStyle("fontSize", e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="">폰트 크기</option>
                  <option value="1">작게</option>
                  <option value="2">기본</option>
                  <option value="3">중간</option>
                  <option value="4">크게</option>
                  <option value="5">더 크게</option>
                  <option value="6">매우 크게</option>
                  <option value="7">제목 크기</option>
                </select>

                {/* 색상 */}
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  <input
                    type="color"
                    onChange={(e) => applyTextStyle("foreColor", e.target.value)}
                    className="w-8 h-8 border rounded cursor-pointer"
                  />
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* 텍스트 스타일 버튼들 */}
                <Button variant="outline" size="sm" onClick={() => applyTextStyle("bold")}>
                  <Bold className="w-4 h-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={() => applyTextStyle("italic")}>
                  <Italic className="w-4 h-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={() => applyTextStyle("underline")}>
                  <Underline className="w-4 h-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={() => applyTextStyle("strikeThrough")}>
                  <Strikethrough className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300" />

                {/* 이미지 업로드 버튼 */}
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-4 h-4 mr-1" />
                  이미지
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* 텍스트 에디터 */}
          <div className="border rounded-lg overflow-hidden">
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[300px] p-4 focus:outline-none"
              onInput={handleEditorInput}
              suppressContentEditableWarning
            >
              {isEmpty && <span className="placeholder">{placeholder}</span>}
            </div>
          </div>

          {/* 드래그 앤 드롭 영역 */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">이미지를 드래그 앤 드롭하거나</p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              파일 선택
            </Button>
          </div>

          {/* 업로드된 이미지 미리보기 */}
          {uploadedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">업로드된 이미지 ({uploadedImages.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt="업로드된 이미지"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
