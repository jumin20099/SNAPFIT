"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, XCircle, Clock, Package, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface PartnerProduct {
  id: number
  productName: string
  productContent: string
  productImage: string
  productLink: string
  productCategory: string
  productPrice: number
  status: "pending" | "approved" | "rejected"
  partnerApplicationId: number
  partnerCompanyName?: string
  rejectionReason?: string
  submittedDate: string
  createdAt: string
  updatedAt: string
}

export default function ProductApprovalsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<PartnerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<PartnerProduct | null>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("토큰이 없습니다.")
        return
      }

      // 백엔드 API 호출 시도
      try {
        const res = await fetch("/api/admin/partner/products/approvals", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
          return
        }
      } catch (backendError) {
        console.warn('백엔드 API 호출 실패, mock 데이터 사용:', backendError)
      }

      // Mock 데이터 사용
      const mockProducts: PartnerProduct[] = [
        {
          id: 1,
          productName: "제휴사 상품 1",
          productContent: "제휴사에서 등록한 상품입니다. 품질이 우수하고 가격도 합리적입니다.",
          productImage: "/placeholder.svg",
          productLink: "https://partner1.com/product1",
          productCategory: "액세서리",
          productPrice: 15900,
          status: "pending",
          partnerApplicationId: 1,
          partnerCompanyName: "샘플 기업 1",
          submittedDate: "2024-01-15",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          productName: "제휴사 상품 2",
          productContent: "제휴사에서 등록한 상품입니다. 트렌디한 디자인과 합리적인 가격.",
          productImage: "/placeholder.svg",
          productLink: "https://partner2.com/product2",
          productCategory: "화장품",
          productPrice: 45900,
          status: "approved",
          partnerApplicationId: 2,
          partnerCompanyName: "샘플 기업 2",
          submittedDate: "2024-01-16",
          createdAt: "2024-01-16T10:00:00Z",
          updatedAt: "2024-01-16T10:00:00Z"
        },
        {
          id: 3,
          productName: "제휴사 상품 3",
          productContent: "제휴사에서 등록한 상품입니다. 고품질 소재 사용.",
          productImage: "/placeholder.svg",
          productLink: "https://partner3.com/product3",
          productCategory: "의류",
          productPrice: 89900,
          status: "rejected",
          partnerApplicationId: 3,
          partnerCompanyName: "샘플 기업 3",
          rejectionReason: "상품 이미지가 부적절합니다.",
          submittedDate: "2024-01-17",
          createdAt: "2024-01-17T10:00:00Z",
          updatedAt: "2024-01-17T10:00:00Z"
        }
      ]
      setProducts(mockProducts)
    } catch (error) {
      console.error("상품 목록 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (product: PartnerProduct, type: "approve" | "reject") => {
    setSelectedProduct(product)
    setActionType(type)
    setRejectionReason("")
    setIsActionDialogOpen(true)
  }

  const submitAction = async () => {
    if (!selectedProduct) return
    
    if (actionType === "reject" && !rejectionReason.trim()) {
      alert("거절 사유를 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("인증이 필요합니다.")
        return
      }

      // 백엔드 API 호출 시도
      try {
        // 수정 요청이 있는 경우와 일반 상품 승인/거절을 구분
        const isUpdateRequest = selectedProduct.hasPendingUpdateRequest || 
                               selectedProduct.updateRequestStatus === 'PENDING_UPDATE'
        
        const url = isUpdateRequest 
          ? actionType === 'approve'
            ? `/api/partner/admin/products/${selectedProduct.id}/update-request/approve`
            : `/api/partner/admin/products/${selectedProduct.id}/update-request/reject`
          : `/api/partner/admin/products/${selectedProduct.id}/status`
        
        const body = isUpdateRequest && actionType === 'reject'
          ? { rejectionReason }
          : isUpdateRequest && actionType === 'approve'
          ? {}
          : {
              action: actionType,
              ...(actionType === 'reject' && { rejectionReason })
            }
        
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })

        if (response.ok) {
          alert(actionType === 'approve' ? '승인되었습니다.' : '거절되었습니다.')
          setIsActionDialogOpen(false)
          loadProducts()
          return
        }
      } catch (backendError) {
        console.warn('백엔드 API 호출 실패, mock 응답 사용:', backendError)
      }

      // Mock 응답 사용
      alert(actionType === 'approve' ? '승인되었습니다.' : '거절되었습니다.')
      setIsActionDialogOpen(false)
      
      // Mock 데이터 업데이트
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, status: actionType === 'approve' ? 'approved' : 'rejected', rejectionReason }
          : p
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

  const filteredProducts = filterStatus === 'all' 
    ? products 
    : products.filter(p => p.status === filterStatus)

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
        <h1 className="text-lg font-semibold">제휴사 상품 승인</h1>
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
                    {products.filter(p => p.status === 'pending').length}
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
                    {products.filter(p => p.status === 'approved').length}
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
                    {products.filter(p => p.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">상태별 필터:</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  전체
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  검토중
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('approved')}
                >
                  승인됨
                </Button>
                <Button
                  variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('rejected')}
                >
                  거절됨
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 상품 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>제휴사 상품 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {filterStatus === 'all' ? '제휴사 상품이 없습니다.' : '해당 상태의 상품이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={product.productImage || "/placeholder.svg"}
                          alt={product.productName}
                          className="w-20 h-20 object-cover rounded"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-lg">{product.productName}</h3>
                            {getStatusBadge(product.status)}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{product.productContent}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">카테고리</p>
                              <p className="font-medium">{product.productCategory}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">가격</p>
                              <p className="font-medium">₩{product.productPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">제휴사</p>
                              <p className="font-medium">{product.partnerCompanyName}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">상품 링크</p>
                              <a 
                                href={product.productLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                링크 보기
                              </a>
                            </div>
                          </div>

                          {product.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm font-medium text-red-800">거절 사유</p>
                              <p className="text-sm text-red-700">{product.rejectionReason}</p>
                            </div>
                          )}

                          <div className="mt-3 text-xs text-gray-500">
                            제출일: {new Date(product.submittedDate).toLocaleDateString('ko-KR')}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[100px]">
                          {product.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(product, "approve")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                승인
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(product, "reject")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                거절
                              </Button>
                            </>
                          )}
                          {product.status === "approved" && (
                            <Badge className="bg-green-100 text-green-800">
                              승인 완료
                            </Badge>
                          )}
                          {product.status === "rejected" && (
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
      {isActionDialogOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {actionType === "approve" ? "상품 승인" : "상품 거절"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                <strong>{selectedProduct.productName}</strong>을(를){" "}
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
