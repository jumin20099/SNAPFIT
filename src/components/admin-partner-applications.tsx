"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react'

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

interface PartnerApplicationAction {
  action: "approve" | "reject"
  rejectionReason?: string
}

export default function AdminPartnerApplications() {
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
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/partner/applications", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setApplications(data)
      } else {
        console.error("제휴 신청 목록 로드 실패:", res.status)
      }
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

  const submitAction = async (applicationId: number, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      const actionData = action === 'approve' 
        ? { action: 'approve' }
        : { action: 'reject', rejectionReason };
      
      console.log('Sending action data:', actionData);
      const url = `/api/admin/partner-status?id=${applicationId}`;
      console.log('URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      // 성공 후 팝업창 닫기
      setIsActionDialogOpen(false);
      
      // 목록 다시 로드 (승인/거절된 항목이 제외된 새로운 목록)
      await loadApplications();
      
      alert(`파트너 신청이 ${action === 'approve' ? '승인' : '거절'}되었습니다.`);
    } catch (error) {
      console.error('Error:', error);
      alert('작업 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            대기중
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">제휴 신청 관리</h1>
        <p className="text-gray-600">제휴사 신청을 승인하거나 거절할 수 있습니다.</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            제휴 신청이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{application.companyName}</CardTitle>
                    <p className="text-sm text-gray-600">{application.contactEmail}</p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium">연락처</Label>
                    <p className="text-sm">{application.contactPhone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">사업자등록번호</Label>
                    <p className="text-sm">{application.businessRegistration}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">제휴사 링크</Label>
                    {application.storeLink ? (
                      <a 
                        href={application.storeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {application.storeLink}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">링크 없음</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">신청일</Label>
                    <p className="text-sm">{formatDate(application.applicationDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">사업자등록증</Label>
                    {application.businessRegistrationFile ? (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <a 
                          href={application.businessRegistrationFile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          파일 보기
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">파일 없음</p>
                    )}
                  </div>
                </div>

                {application.status === "rejected" && application.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <Label className="text-sm font-medium text-red-800">거절 사유</Label>
                    <p className="text-sm text-red-700 mt-1">{application.rejectionReason}</p>
                  </div>
                )}

                {application.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(application, "approve")}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      승인
                    </Button>
                    <Button
                      onClick={() => handleAction(application, "reject")}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      거절
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 액션 다이얼로그 */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "제휴 신청 승인" : "제휴 신청 거절"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedApplication && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedApplication.companyName}</strong>의 제휴 신청을 
                  {actionType === "approve" ? "승인" : "거절"}하시겠습니까?
                </p>
              </div>
            )}
            
            {actionType === "reject" && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">거절 사유 *</Label>
                <Input
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="거절 사유를 입력해주세요..."
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsActionDialogOpen(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                onClick={() => submitAction(selectedApplication?.id || 0, actionType, rejectionReason)}
                disabled={isSubmitting}
                className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {isSubmitting ? "처리 중..." : (actionType === "approve" ? "승인" : "거절")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 