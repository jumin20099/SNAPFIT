"use client"

import { useState } from "react"
import { ArrowLeft, Upload, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PartnerApplicationForm {
  companyName: string
  contactEmail: string
  contactPhone: string
  businessRegistration: string
  businessRegistrationFile?: string
  logo?: string
  storeLink?: string
}

interface PartnerApplicationStandaloneProps {
  isOpen: boolean
  onClose: () => void
}

export default function PartnerApplicationStandalone({ isOpen, onClose }: PartnerApplicationStandaloneProps) {
  const [form, setForm] = useState<PartnerApplicationForm>({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    businessRegistration: '',
    businessRegistrationFile: '',
    logo: '',
    storeLink: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', 'partner_application')
      formData.append('refId', '0') // refId는 기본값 0으로

      const token = localStorage.getItem("token")
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setForm(prev => ({
          ...prev,
          businessRegistrationFile: data.url
        }))
      } else {
        alert('파일 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert('파일 업로드 중 오류가 발생했습니다.')
    }
  }

  const handleLogoUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', 'partner_logo')
      formData.append('refId', '0') // 임시 refId

      const token = localStorage.getItem("token")
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setForm(prev => ({
          ...prev,
          logo: data.url
        }))
      } else {
        alert('로고 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('Logo upload error:', error)
      alert('로고 업로드 중 오류가 발생했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.companyName || !form.contactEmail || !form.contactPhone || !form.businessRegistration) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/partner/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const errorText = await response.text()
        alert('제휴 신청에 실패했습니다: ' + errorText)
      }
    } catch (error) {
      console.error('Application submission error:', error)
      alert('제휴 신청 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
        <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">제휴 신청</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">제휴 신청이 완료되었습니다!</h2>
              <p className="text-gray-600 mb-4">
                제휴 신청이 성공적으로 접수되었습니다. 
                관리자 검토 후 승인 여부를 연락처로 안내드리겠습니다.
              <p>
                귀사의 제휴 신청에 진심으로 감사드립니다.
              </p>
              </p>
              <p className="text-sm text-gray-500">
                승인 후 제휴사 대시보드에 접속할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">제휴 신청</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">제휴사 등록 신청</h2>
            <p className="text-gray-600">제휴사로 등록하기 위해 필요한 정보를 입력해주세요.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>제휴사 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 회사명 */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">회사명 *</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="회사명을 입력하세요"
                    required
                  />
                </div>

                {/* 제휴사 로고 업로드 */}
                <div className="space-y-2">
                  <Label htmlFor="logoFile">제휴사 로고</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="logoFile"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleLogoUpload(file)
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="logoFile"
                      className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <Upload className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-600">
                        {form.logo ? '로고가 업로드되었습니다' : '로고 파일을 선택하세요'}
                      </span>
                    </label>
                    {form.logo && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <FileText className="w-4 h-4" />
                        로고 업로드 완료
                      </div>
                    )}
                  </div>
                </div>

                {/* 연락처 이메일 */}
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">연락처 이메일 *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>

                {/* 연락처 전화번호 */}
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">연락처 전화번호 *</Label>
                  <Input
                    id="contactPhone"
                    value={form.contactPhone}
                    onChange={(e) => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="전화번호를 입력하세요"
                    required
                  />
                </div>

                {/* 사업자등록번호 */}
                <div className="space-y-2">
                  <Label htmlFor="businessRegistration">사업자등록번호 *</Label>
                  <Input
                    id="businessRegistration"
                    value={form.businessRegistration}
                    onChange={(e) => setForm(prev => ({ ...prev, businessRegistration: e.target.value }))}
                    placeholder="사업자등록번호를 입력하세요"
                    required
                  />
                </div>

                {/* 제휴사 링크 */}
                <div className="space-y-2">
                  <Label htmlFor="storeLink">제휴사 링크</Label>
                  <Input
                    id="storeLink"
                    type="url"
                    value={form.storeLink}
                    onChange={(e) => setForm(prev => ({ ...prev, storeLink: e.target.value }))}
                    placeholder="https://example.com"
                  />
                  <p className="text-sm text-gray-500">고객이 접속할 수 있는 제휴사 홈페이지나 쇼핑몰 링크를 입력하세요.</p>
                </div>

                {/* 사업자등록증 업로드 */}
                <div className="space-y-2">
                  <Label htmlFor="businessRegistrationFile">사업자등록증 *</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="businessRegistrationFile"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(file)
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="businessRegistrationFile"
                      className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <Upload className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-600">
                        {form.businessRegistrationFile ? '파일이 업로드되었습니다' : '파일을 선택하세요'}
                      </span>
                    </label>
                    {form.businessRegistrationFile && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <FileText className="w-4 h-4" />
                        파일 업로드 완료
                      </div>
                    )}
                  </div>
                </div>

                {/* 제출 버튼 */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? '제출 중...' : '제휴 신청 제출'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 