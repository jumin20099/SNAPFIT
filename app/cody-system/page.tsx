'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
// import CodySystem from '@/components/cody-system'

export default function CodySystemPage() {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get('pid')

  useEffect(() => {
    // 페이지 로드 시 자동으로 모달 열기
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    // 모달 닫기 후 홈으로 이동
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* <CodySystem 
        isOpen={isOpen} 
        onClose={handleClose}
        // productId를 props로 전달 (필요시)
        initialProductId={productId}
      /> */}
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">CodySystem 컴포넌트가 준비 중입니다.</p>
      </div>
    </div>
  )
}
