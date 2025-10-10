"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useReport } from "@/hooks/useReport"

interface Report {
  reportId: number;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: number;
  reason: string;
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  resolvedAt?: string;
}

interface ReportListResponse {
  content: Report[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800", 
  RESOLVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800"
}

const statusLabels = {
  PENDING: "대기중",
  PROCESSING: "처리중",
  RESOLVED: "해결됨",
  REJECTED: "거부됨"
}

const targetTypeLabels = {
  POST: "게시글",
  COMMENT: "댓글",
  USER: "사용자"
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  // 신고 목록 조회 (임시 API 호출)
  const fetchReports = async (status?: string) => {
    setLoading(true)
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리
      
      let url = 'http://localhost:8080/api/reports/admin'
      if (status && status !== 'all') {
        url += `?status=${status.toUpperCase()}`
      }
      
      const response = await fetch(url, {
        credentials: 'include', // HttpOnly 쿠키 자동 전송
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data: ReportListResponse = await response.json()
        setReports(data.content || [])
      } else {
        console.error('신고 목록 조회 실패:', response.statusText)
        // 백엔드 미연결 시 더미 데이터
        setReports([
          {
            reportId: 1,
            targetType: 'POST',
            targetId: 101,
            reason: '부적절한 콘텐츠',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            reportId: 2,
            targetType: 'COMMENT',
            targetId: 201,
            reason: '스팸 또는 광고',
            status: 'PROCESSING',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('신고 목록 조회 오류:', error)
      // 더미 데이터로 대체
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  // 신고 상태 변경
  const updateReportStatus = async (reportId: number, newStatus: string, notes?: string) => {
    setProcessing(true)
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리
      
      const url = new URL(`http://localhost:8080/api/reports/${reportId}/status`)
      url.searchParams.append('status', newStatus)
      if (notes) {
        url.searchParams.append('adminNotes', notes)
      }

      const response = await fetch(url.toString(), {
        method: 'PUT',
        credentials: 'include', // HttpOnly 쿠키 자동 전송
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('신고 상태가 변경되었습니다')
        // 목록 새로고침
        await fetchReports(activeTab)
        setSelectedReport(null)
        setAdminNotes("")
      } else {
        const errorData = await response.json()
        alert(`상태 변경 실패: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('신고 상태 변경 오류:', error)
      alert('상태 변경 중 오류가 발생했습니다')
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    fetchReports(activeTab)
  }, [activeTab])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'PROCESSING': return <AlertTriangle className="w-4 h-4" />
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">신고 관리</h1>
        </div>
        <Badge variant="outline">관리자</Badge>
      </div>

      <div className="p-6">
        {/* 상태별 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" data-testid="reports-tab-all">전체</TabsTrigger>
            <TabsTrigger value="pending" data-testid="reports-tab-pending">대기중</TabsTrigger>
            <TabsTrigger value="processing" data-testid="reports-tab-processing">처리중</TabsTrigger>
            <TabsTrigger value="resolved" data-testid="reports-tab-resolved">해결됨</TabsTrigger>
            <TabsTrigger value="rejected" data-testid="reports-tab-rejected">거부됨</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">신고 목록을 불러오는 중...</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">신고가 없습니다.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.reportId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className={statusColors[report.status]}>
                              {getStatusIcon(report.status)}
                              {statusLabels[report.status]}
                            </Badge>
                            <Badge variant="secondary">
                              {targetTypeLabels[report.targetType]} #{report.targetId}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              신고ID: #{report.reportId}
                            </span>
                          </div>
                          <div className="text-sm mb-2">
                            <strong>신고 사유:</strong> {report.reason}
                          </div>
                          <div className="text-xs text-gray-500">
                            신고일시: {formatDate(report.createdAt)}
                            {report.updatedAt !== report.createdAt && (
                              <span className="ml-4">
                                수정일시: {formatDate(report.updatedAt)}
                              </span>
                            )}
                          </div>
                          {report.adminNotes && (
                            <div className="text-sm mt-2 p-2 bg-blue-50 rounded">
                              <strong>관리자 메모:</strong> {report.adminNotes}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {report.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedReport(report)}
                                data-testid={`process-report-${report.reportId}`}
                              >
                                처리
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateReportStatus(report.reportId, 'REJECTED', '부당한 신고')}
                                disabled={processing}
                                data-testid={`reject-report-${report.reportId}`}
                              >
                                거부
                              </Button>
                            </>
                          )}
                          {report.status === 'PROCESSING' && (
                            <Button 
                              size="sm"
                              onClick={() => updateReportStatus(report.reportId, 'RESOLVED', '처리 완료')}
                              disabled={processing}
                              data-testid={`resolve-report-${report.reportId}`}
                            >
                              해결 완료
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 신고 처리 모달 */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="process-report-modal">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">신고 처리</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                신고ID: #{selectedReport.reportId}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                대상: {targetTypeLabels[selectedReport.targetType]} #{selectedReport.targetId}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                사유: {selectedReport.reason}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  관리자 메모
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="처리 내용을 입력하세요..."
                  data-testid="admin-notes-input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedReport(null)
                  setAdminNotes("")
                }}
                disabled={processing}
              >
                취소
              </Button>
              <Button 
                onClick={() => updateReportStatus(selectedReport.reportId, 'PROCESSING', adminNotes)}
                disabled={processing}
                data-testid="confirm-process-report"
              >
                {processing ? "처리중..." : "처리 시작"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
