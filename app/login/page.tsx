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

  const handleGoogleLogin = () => {
    // 구글 로그인 로직
    console.log('구글 로그인')
    alert('구글 로그인은 준비 중입니다.')
  }

  const handleNaverLogin = () => {
    // 네이버 로그인 로직
    console.log('네이버 로그인')
    alert('네이버 로그인은 준비 중입니다.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo/Brand Section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SNAPFIT</h1>
              <p className="text-gray-600">패션을 더 스마트하게</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">환영합니다!</h2>
            <p className="text-gray-600 text-sm">소셜 계정으로 간편하게 시작하세요</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-4">
            {/* Kakao Login */}
            <Button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-0"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <span className="text-yellow-400 text-sm font-bold">K</span>
                  </div>
                  <span>카카오로 시작하기</span>
                </div>
              )}
            </Button>

            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-gray-200"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <span>Google로 시작하기</span>
              </div>
            </Button>

            {/* Naver Login */}
            <Button
              onClick={handleNaverLogin}
              className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-0"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-sm font-bold">N</span>
                </div>
                <span>네이버로 시작하기</span>
              </div>
            </Button>

            {/* Apple Login */}
            <Button
              onClick={() => {
                // 애플 로그인 로직
                console.log('애플 로그인')
                alert('애플 로그인은 준비 중입니다.')
              }}
              className="w-full h-14 bg-black hover:bg-gray-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-0"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <span>Apple로 시작하기</span>
              </div>
            </Button>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              계속 진행하면 SNAPFIT의{' '}
              <button 
                className="text-blue-600 underline"
                onClick={() => router.push('/terms')}
              >
                서비스 약관
              </button>
              과{' '}
              <button 
                className="text-blue-600 underline"
                onClick={() => router.push('/privacy')}
              >
                개인정보 처리방침
              </button>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700 font-medium">빠르고 안전한 로그인</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 mb-2">
              계정이 없으신가요?
            </p>
            <Button
              type="button"
              variant="link"
              onClick={() => router.push('/signup')}
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              회원가입하기
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-400">© 2024 SNAPFIT. All rights reserved.</p>
      </div>
    </div>
  )
}
