"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, FileText, Mail, Phone, Building, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStoreApplications, approveStoreApplication } from "../actions/admin-actions"

interface StoreApplication {
  id: number
  company_name: string
  contact_email: string
  contact_phone: string
  business_registration: string
  application_date: string
  status: "pending" | "approved" | "rejected"
  documents: string[]
}

interface StoreApplicationsPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function StoreApplicationsPage({ isOpen, onClose }: StoreApplicationsPageProps) {
  const [applications, setApplications] = useState<StoreApplication[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadApplications()
    }
  }, [isOpen])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const data = await getStoreApplications()
      setApplications(data)
    } catch (error) {
      console.error("신청서 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: number, approved: boolean) => {
    const action = approved ? "승인" : "거절"
    if (confirm(`이 제휴 신청을 ${action}하시겠습니까?`)) {
      const result = await approveStoreApplication(applicationId, approved)
      if (result.success) {
        alert(result.message)
        loadApplications()
      } else {
        alert(result.message)
      }
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

  const pendingApplications = applications.filter((app) => app.status === "pending")
  const processedApplications = applications.filter((app) => app.status !== "pending")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">제휴 신청 관리</h1>
        </div>
        <Badge variant="secondary">Applications</Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">전체 신청</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">검토 대기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">처리 완료</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{processedApplications.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* 검토 대기 신청서 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              검토 대기 ({pendingApplications.length})
            </h2>

            {loading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : pendingApplications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>검토 대기 중인 신청서가 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <Card key={application.id} className="border-yellow-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg">{application.company_name}</h3>
                          {getStatusBadge(application.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">이메일:</span>
                              <span>{application.contact_email}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">전화번호:</span>
                              <span>{application.contact_phone}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">사업자등록번호:</span>
                              <span>{application.business_registration}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">신청일:</span>
                              <span>{application.application_date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm text-gray-600">제출 서류:</span>
                          <div className="flex flex-wrap gap-2">
                            {application.documents.map((doc, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(application.id, false)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            거절
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(application.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            승인
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 처리 완료 신청서 */}
          {processedApplications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                처리 완료 ({processedApplications.length})
              </h2>

              <div className="space-y-4">
                {processedApplications.map((application) => (
                  <Card key={application.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{application.company_name}</h3>
                          <p className="text-sm text-gray-600">{application.contact_email}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(application.status)}
                          <p className="text-xs text-gray-500 mt-1">{application.application_date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
