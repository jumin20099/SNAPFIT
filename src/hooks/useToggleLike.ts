'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function useToggleLike() {
  const [isLoading, setIsLoading] = useState(false)

  const toggleLike = async (productId: number): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/products/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.success || false
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('좋아요 토글 실패:', errorData)
        return false
      }
    } catch (error) {
      console.error('좋아요 토글 오류:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    toggleLike,
    isLoading
  }
}
