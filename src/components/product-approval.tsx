"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, XCircle, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProductApprovals, approveProduct } from "../actions/admin-actions"

interface ProductApproval {
  id: number
  product_name: string
  partner_name: string
  images: string[]
  description: string
  price: string
  category: string
  status: "pending" | "approved" | "rejected"
  submitted_date: string
}

interface ProductApprovalPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProductApprovalPage({ isOpen, onClose }: ProductApprovalPageProps) {
  const [approvals, setApprovals] = useState<ProductApproval[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadApprovals()
    }
  }, [isOpen])

  const loadApprovals = async () => {
    setLoading(true)
    try {
      const data = await getProductApprovals()
      setApprovals(data)
    } catch (error) {
      console.error("승인 대기 상품 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (productId: number, approved: boolean) => {
    const action = approved ? "승인" : "거절"
    if (confirm(`이 상품을 ${action}하시겠습니까?`)) {
      const result = await approveProduct(productId, approved)
      if (result.success) {
        alert(result.message)
        loadApprovals()
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

  const pendingApprovals = approvals.filter((approval) => approval.status === "pending")
  const processedApprovals = approvals.filter((approval) => approval.status !== "pending")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">상품 승인 관리</h1>
        </div>
        <Badge variant="secondary">Product Approval</Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">전체 상품</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvals.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">승인 대기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingApprovals.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">처리 완료</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{processedApprovals.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* 승인 대기 상품 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              승인 대기 ({pendingApprovals.length})
            </h2>

            {loading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : pendingApprovals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>승인 대기 중인 상품이 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <Card key={approval.id} className="border-yellow-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-lg">{approval.product_name}</h3>
                            <p className="text-sm text-gray-600">{approval.partner_name}</p>
                          </div>
                          {getStatusBadge(approval.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 상품 이미지 */}
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-600">상품 이미지:</span>
                            <div className="grid grid-cols-2 gap-2">
                              {approval.images.map((image, index) => (
                                <div key={index} className="w-full h-24 border rounded overflow-hidden">
                                  <img
                                    src={image || "/placeholder.svg"}
                                    alt={`상품 이미지 ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 상품 정보 */}
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-600">카테고리:</span>
                              <Badge variant="outline" className="ml-2">
                                {approval.category}
                              </Badge>
                            </div>

                            <div>
                              <span className="text-sm font-medium text-gray-600">가격:</span>
                              <span className="ml-2 font-medium">{approval.price}</span>
                            </div>

                            <div>
                              <span className="text-sm font-medium text-gray-600">제출일:</span>
                              <span className="ml-2">{approval.submitted_date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-600">상품 설명:</span>
                          <p className="text-sm bg-gray-50 p-3 rounded">{approval.description}</p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(approval.id, false)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            거절
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(approval.id, true)}
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

          {/* 처리 완료 상품 */}
          {processedApprovals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                처리 완료 ({processedApprovals.length})
              </h2>

              <div className="space-y-4">
                {processedApprovals.map((approval) => (
                  <Card key={approval.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={approval.images[0] || "/placeholder.svg"}
                            alt={approval.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-medium">{approval.product_name}</h3>
                            <p className="text-sm text-gray-600">{approval.partner_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(approval.status)}
                          <p className="text-xs text-gray-500 mt-1">{approval.submitted_date}</p>
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
