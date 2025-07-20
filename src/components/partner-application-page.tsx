"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Upload, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PartnerApplication {
  id?: number
  companyName: string
  contactEmail: string
  contactPhone: string
  businessRegistration: string
  businessRegistrationFile?: string
  applicationDate?: string
  status: "pending" | "approved" | "rejected"
  documents?: string[]
}

interface PartnerApplicationPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function PartnerApplicationPage({ isOpen, onClose }: PartnerApplicationPageProps) {
  const [application, setApplication] = useState<PartnerApplication | null>(null)
  const [form, setForm] = useState({
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    businessRegistration: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // 기존 신청이 있는지 확인
    loadApplication()
  }, [])

  const loadApplication = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/partner/application", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setApplication(data)
        if (data) {
          setForm({
            companyName: data.companyName || "",
            contactEmail: data.contactEmail || "",
            contactPhone: data.contactPhone || "",
            businessRegistration: data.businessRegistration || "",
          })
        }
      } else {
        console.error("신청 정보 로드 실패:", res.status, res.statusText)
        // API 실패 시 기본 폼 상태 유지
      }
    } catch (error) {
      console.error("신청 정보 로드 실패:", error)
      // 네트워크 에러 시 기본 폼 상태 유지
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("purpose", "business_registration")
    formData.append("refId", "0")

    setUploading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const errorText = await res.text()
        alert("파일 업로드 실패: " + errorText)
        return
      }
      const { url } = await res.json()
      setForm(prev => ({ ...prev, businessRegistration: url }))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const url = application?.id 
        ? `/api/partner/application/${application.id}`
        : "/api/partner/application"
      const method = application?.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        alert(application?.id ? "신청이 수정되었습니다!" : "신청이 제출되었습니다!")
        loadApplication()
      } else {
        const errorText = await res.text()
        alert("신청 실패: " + errorText)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            검토중
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            승인
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            거절
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (!isOpen) return null

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
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

                {/* 연락처 이메일 */}
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">연락처 이메일 *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="contact@company.com"
                    required
                  />
                </div>

                {/* 연락처 전화번호 */}
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">연락처 전화번호 *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="010-1234-5678"
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
                    placeholder="123-45-67890"
                    required
                  />
                </div>

                {/* 사업자등록증 업로드 */}
                <div className="space-y-2">
                  <Label htmlFor="businessRegistrationFile">사업자등록증 *</Label>
                  <Input
                    id="businessRegistrationFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    required={!form.businessRegistration}
                  />
                  {uploading && <p className="text-sm text-gray-600">업로드 중...</p>}
                  {form.businessRegistration && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">파일이 업로드되었습니다</span>
                    </div>
                  )}
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || uploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? "제출 중..." : (application?.id ? "수정" : "신청 제출")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 신청 상태 정보 */}
          {application ? (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>신청 상태</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">신청일</span>
                    <span className="text-sm text-gray-600">
                      {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString('ko-KR') : "신청일 없음"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">상태</span>
                    {getStatusBadge(application.status)}
                  </div>
                  {application.status === "rejected" && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        신청이 거절되었습니다. 자세한 사유는 관리자에게 문의해주세요.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>신청 상태</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">아직 신청을 제출하지 않았습니다.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 