"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Post } from '@/shared/types'
import ApiClient from '@/shared/utils/api-client'
import TokenManager from '@/shared/utils/token-manager'

interface PostDeleteModalProps {
  post: Post | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  boardType: 'QUESTION' | 'INFO'
}

/**
 * 게시글 삭제 모달 컴포넌트
 * 
 * 기능:
 * - 게시글 삭제 확인
 * - 비회원 게시글의 경우 비밀번호 입력
 * - 삭제 완료 후 성공 콜백 호출
 * 
 * @param post 삭제할 게시글 정보
 * @param isOpen 모달 열림/닫힘 상태
 * @param onClose 모달 닫기 콜백
 * @param onSuccess 삭제 성공 콜백
 * @param boardType 게시판 타입 (QUESTION 또는 INFO)
 */
export function PostDeleteModal({ 
  post, 
  isOpen, 
  onClose, 
  onSuccess, 
  boardType 
}: PostDeleteModalProps) {
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      const tokenManager = TokenManager.getInstance()
      const accessToken = tokenManager.getAccessToken()
      const refreshToken = tokenManager.getRefreshToken()
      
      // 액세스 토큰이 유효하거나 리프레시 토큰이 있으면 로그인 상태
      const hasValidAccessToken = accessToken && tokenManager.isAccessTokenValid()
      const hasRefreshToken = !!refreshToken
      
      setIsLoggedIn(hasValidAccessToken || hasRefreshToken)
    }
    
    checkLoginStatus()
  }, [isOpen])

  // 모달이 열릴 때 비밀번호 초기화
  const handleOpen = () => {
    setPassword('')
  }

  // 삭제 요청 처리
  const handleDelete = async () => {
    if (!post) return

    // 비회원 사용자인 경우 비밀번호 검증
    if (!isLoggedIn && !password.trim()) {
      toast.error('비밀번호를 입력해주세요.')
      return
    }

    setDeleting(true)
    try {
      const requestData = !isLoggedIn ? {
        anonymousPassword: password.trim()
      } : {}

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      
      // 로그인한 사용자는 ApiClient 사용 (자동 토큰 갱신)
      if (isLoggedIn) {
        const apiClient = ApiClient.getInstance()
        await apiClient.delete(`/api/posts/${post.postId}`, {
          data: requestData
        })
      } else {
        // 비회원 사용자는 직접 fetch 사용
        const response = await fetch(`${API_BASE_URL}/api/posts/${post.postId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(requestData)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: '삭제에 실패했습니다.' }))
          throw new Error(errorData.error || '삭제에 실패했습니다.')
        }
      }

      toast.success('게시글이 삭제되었습니다.')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('게시글 삭제 실패:', error)
      toast.error('게시글 삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {boardType === 'QUESTION' ? '질문' : '정보'} 게시글 삭제
          </DialogTitle>
          <DialogDescription>
            정말로 이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다.
            {!isLoggedIn ? ' 비회원 사용자는 비밀번호가 필요합니다.' : ''}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!isLoggedIn && (
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="게시글 작성시 입력한 비밀번호"
                minLength={4}
                required
              />
              <p className="text-sm text-gray-500">
                비회원 사용자는 게시글 삭제를 위해 비밀번호가 필요합니다.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
