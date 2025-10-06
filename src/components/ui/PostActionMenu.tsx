'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'

interface PostActionMenuProps {
  postId: number
  isOwner: boolean
  onEdit: (postId: number) => void
  onDelete: (postId: number) => void
  className?: string
}

export function PostActionMenu({ 
  postId, 
  isOwner, 
  onEdit, 
  onDelete, 
  className = '' 
}: PostActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 메뉴 토글
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation() // 게시글 클릭 이벤트 방지
    setIsOpen(!isOpen)
  }

  // 수정 버튼 클릭
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onEdit(postId)
  }

  // 삭제 버튼 클릭
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onDelete(postId)
  }

  // 소유자가 아닌 경우 메뉴를 표시하지 않음
  if (!isOwner) {
    return null
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* 더보기 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="h-8 w-8 p-0 hover:bg-gray-100"
        aria-label="게시글 메뉴"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            <button
              onClick={handleEdit}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              수정
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
