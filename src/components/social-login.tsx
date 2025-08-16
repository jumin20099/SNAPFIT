"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface SocialLoginPageProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignup: () => void
}

// 쿠키에서 값을 가져오는 함수
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// 쿠키를 삭제하는 함수
function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export default function SocialLoginPage({ open, onOpenChange, onSwitchToSignup }: SocialLoginPageProps) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSocialLogin = () => {
    window.location.href = '/oauth2/authorization/kakao';
  };

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.token) {
          // localStorage에 토큰 저장
          localStorage.setItem('token', data.token);
          setUser(data);
          setIsLoggedIn(true);
          onOpenChange(false);
        }
      } else {
        const errorData = await response.json();
        console.error('에러 데이터:', errorData);
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
    }
  };

  useEffect(() => {
    // auth_token 쿠키에서 토큰 확인
    const token = getCookie('auth_token');
    console.log('쿠키에서 읽은 토큰:', token ? '존재함' : '없음');
    
    // 모든 쿠키 확인
    console.log('모든 쿠키:', document.cookie);

    if (token) {
      // localStorage에 토큰 저장
      localStorage.setItem('token', token);
      console.log('localStorage에 토큰 저장됨');
      // 쿠키는 백엔드에서 관리하므로 삭제하지 않음
      checkLoginStatus();
    } else {
      // 토큰이 없으면 주기적으로 로그인 상태 확인
      const interval = setInterval(checkLoginStatus, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="p-2">
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
              onClick={handleSocialLogin}
              className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-0"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-yellow-400 text-sm font-bold">K</span>
                </div>
                <span>카카오로 시작하기</span>
              </div>
            </Button>

            {/* Google Login */}
            <Button
              onClick={() => handleSocialLogin()}
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
              onClick={() => handleSocialLogin()}
              className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-0"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-sm font-bold">N</span>
                </div>
                <span>네이버로 시작하기</span>
              </div>
            </Button>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              계속 진행하면 SNAPFIT의 <button className="text-blue-600 underline">서비스 약관</button>과{" "}
              <button className="text-blue-600 underline">개인정보 처리방침</button>에 동의하는 것으로 간주됩니다.
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700 font-medium">빠르고 안전한 로그인</span>
            </div>
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
