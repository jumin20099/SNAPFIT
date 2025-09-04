"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleKakaoLogin = async () => {
    setIsLoading(true)
    try {
      // 백엔드의 OAuth2 엔드포인트로 리다이렉트
      window.location.href = 'http://localhost:8080/oauth2/authorization/kakao'
    } catch (error) {
      console.error('카카오 로그인 실패:', error)
      alert('카카오 로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">로그인</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo/Brand Section */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">SNAPFIT</h1>
              <p className="text-gray-600 text-sm">패션을 더 스마트하게</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">환영합니다!</h2>
            <p className="text-gray-600 text-sm">간편하게 로그인하세요</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Kakao Login */}
            <Button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              data-testid="kakao-login-button"
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                    <span className="text-yellow-400 text-xs font-bold">K</span>
                  </div>
                  <span>카카오로 시작하기</span>
                </div>
              )}
            </Button>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              계속 진행하면 SNAPFIT의{' '}
              <button 
                className="text-gray-600 underline hover:text-gray-800"
                onClick={() => router.push('/terms')}
              >
                서비스 약관
              </button>
              과{' '}
              <button 
                className="text-gray-600 underline hover:text-gray-800"
                onClick={() => router.push('/privacy')}
              >
                개인정보 처리방침
              </button>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
