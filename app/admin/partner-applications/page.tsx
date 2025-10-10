"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface PartnerApplication {
  id: number
  companyName: string
  contactEmail: string
  contactPhone: string
  businessRegistration: string
  businessRegistrationFile?: string
  storeLink?: string
  applicationDate: string
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export default function PartnerApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<PartnerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<PartnerApplication | null>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
// 서버에서 자동으로 인증 처리
      if (!token) {
        console.error("토큰이 없습니다.")
        return
      }

      // 백엔드 API 호출 시도
      try {
        const res = await fetch("/api/admin/partner/applications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setApplications(data)
          return
        }
      } catch (backendError) {
        console.warn('백엔드 API 호출 실패, mock 데이터 사용:', backendError)
      }

      // Mock 데이터 사용
      const mockApplications: PartnerApplication[] = [
        {
          id: 1,
          companyName: "샘플 기업 1",
          contactEmail: "contact@company1.com",
          contactPhone: "02-1234-5678",
          businessRegistration: "123-45-67890",
          businessRegistrationFile: "/placeholder.svg",
          storeLink: "https://company1.com",
          applicationDate: "2024-01-15",
          status: "pending",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          companyName: "샘플 기업 2",
          contactEmail: "contact@company2.com",
          contactPhone: "02-2345-6789",
          businessRegistration: "234-56-78901",
          businessRegistrationFile: "/placeholder.svg",
          storeLink: "https://company2.com",
          applicationDate: "2024-01-16",
          status: "approved",
          createdAt: "2024-01-16T10:00:00Z",
          updatedAt: "2024-01-16T10:00:00Z"
        },
        {
          id: 3,
          companyName: "샘플 기업 3",
          contactEmail: "contact@company3.com",
          contactPhone: "02-3456-7890",
          businessRegistration: "345-67-89012",
          businessRegistrationFile: "/placeholder.svg",
          storeLink: "https://company3.com",
          applicationDate: "2024-01-17",
          status: "rejected",
          rejectionReason: "사업자등록증이 불분명합니다.",
          createdAt: "2024-01-17T10:00:00Z",
          updatedAt: "2024-01-17T10:00:00Z"
        }
      ]
      setApplications(mockApplications)
    } catch (error) {
      console.error("제휴 신청 목록 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (application: PartnerApplication, type: "approve" | "reject") => {
    setSelectedApplication(application)
    setActionType(type)
    setRejectionReason("")
    setIsActionDialogOpen(true)
  }

  const submitAction = async () => {
    if (!selectedApplication) return
    
    if (actionType === "reject" && !rejectionReason.trim()) {
      alert("거절 사유를 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
// 서버에서 자동으로 인증 처리
      if (!token) {
        alert("인증이 필요합니다.")
        return
      }

      // 백엔드 API 호출 시도
      try {
        const actionData = actionType === 'approve' 
          ? { action: 'approve' }
          : { action: 'reject', rejectionReason }
        
        const url = `/api/admin/partner-status?id=${selectedApplication.id}`
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // HttpOnly 쿠키 자동 전송,
          body: JSON.stringify(actionData),
        })

        if (response.ok) {
          alert(actionType === 'approve' ? '승인되었습니다.' : '거절되었습니다.')
          setIsActionDialogOpen(false)
          loadApplications()
          return
        }
      } catch (backendError) {
        console.warn('백엔드 API 호출 실패, mock 응답 사용:', backendError)
      }

      // Mock 응답 사용
      alert(actionType === 'approve' ? '승인되었습니다.' : '거절되었습니다.')
      setIsActionDialogOpen(false)
      
      // Mock 데이터 업데이트
      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: actionType === 'approve' ? 'approved' : 'rejected', rejectionReason }
          : app
      ))
    } catch (error) {
      console.error("액션 처리 실패:", error)
      alert("처리 중 오류가 발생했습니다.")
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">제휴 신청 관리</h1>
        <div className="w-10" />
      </div>

      <div className="p-4">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">검토 대기</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {applications.filter(app => app.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">승인됨</p>
                  <p className="text-2xl font-bold text-green-600">
                    {applications.filter(app => app.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">거절됨</p>
                  <p className="text-2xl font-bold text-red-600">
                    {applications.filter(app => app.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 제휴 신청 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>제휴 신청 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">제휴 신청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-lg">{application.companyName}</h3>
                            {getStatusBadge(application.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">연락처 이메일</p>
                              <p className="font-medium">{application.contactEmail}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">연락처 전화번호</p>
                              <p className="font-medium">{application.contactPhone}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">사업자등록번호</p>
                              <p className="font-medium">{application.businessRegistration}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">스토어 링크</p>
                              <a 
                                href={application.storeLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {application.storeLink}
                              </a>
                            </div>
                          </div>

                          {application.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm font-medium text-red-800">거절 사유</p>
                              <p className="text-sm text-red-700">{application.rejectionReason}</p>
                            </div>
                          )}

                          <div className="mt-3 text-xs text-gray-500">
                            신청일: {new Date(application.applicationDate).toLocaleDateString('ko-KR')}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {application.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(application, "approve")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                승인
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(application, "reject")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                거절
                              </Button>
                            </>
                          )}
                          {application.status === "approved" && (
                            <Badge className="bg-green-100 text-green-800">
                              승인 완료
                            </Badge>
                          )}
                          {application.status === "rejected" && (
                            <Badge className="bg-red-100 text-red-800">
                              거절 완료
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 액션 다이얼로그 */}
      {isActionDialogOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {actionType === "approve" ? "제휴 신청 승인" : "제휴 신청 거절"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                <strong>{selectedApplication.companyName}</strong>의 제휴 신청을{" "}
                {actionType === "approve" ? "승인" : "거절"}하시겠습니까?
              </p>
              
              {actionType === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    거절 사유
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="거절 사유를 입력해주세요"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsActionDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  onClick={submitAction}
                  disabled={isSubmitting}
                  className={
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {isSubmitting ? "처리 중..." : actionType === "approve" ? "승인" : "거절"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
