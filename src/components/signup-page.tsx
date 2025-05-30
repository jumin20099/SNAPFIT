"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignupPageProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function SignupPage({ isOpen, onClose, onSwitchToLogin }: SignupPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }

    // 회원가입 로직 구현
    console.log("Signup:", { email, password, nickname })
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 회원가입`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">회원가입</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">SNAPFIT</h2>
            <p className="text-gray-600">새로운 패션 경험을 시작하세요</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="h-12"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            {/* Signup Button */}
            <Button type="submit" className="w-full h-12 text-base font-medium">
              회원가입
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <p className="text-center text-sm text-gray-600 mb-4">소셜 계정으로 가입</p>
            <div className="grid grid-cols-4 gap-4">
              {/* Kakao */}
              <Button
                variant="outline"
                className="h-12 bg-yellow-400 border-yellow-400 hover:bg-yellow-500"
                onClick={() => handleSocialLogin("kakao")}
              >
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-yellow-400 text-xs font-bold">K</span>
                </div>
              </Button>

              {/* Google */}
              <Button variant="outline" className="h-12" onClick={() => handleSocialLogin("google")}>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border">
                  <span className="text-blue-500 text-xs font-bold">G</span>
                </div>
              </Button>

              {/* Naver */}
              <Button
                variant="outline"
                className="h-12 bg-green-500 border-green-500 hover:bg-green-600"
                onClick={() => handleSocialLogin("naver")}
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-xs font-bold">N</span>
                </div>
              </Button>

              {/* Instagram */}
              <Button
                variant="outline"
                className="h-12 bg-gradient-to-r from-purple-500 to-pink-500 border-0 hover:from-purple-600 hover:to-pink-600"
                onClick={() => handleSocialLogin("instagram")}
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-500 text-xs font-bold">📷</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center pt-6">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Button variant="link" className="p-0 h-auto text-blue-600" onClick={onSwitchToLogin}>
                로그인
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
