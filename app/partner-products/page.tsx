"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Package, Edit, Trash2, CheckCircle, XCircle, Clock, Trash, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface PartnerProduct {
  id?: number
  productName: string
  productContent: string
  productImage: string
  productLink: string
  genderCategory: string
  majorCategory: string
  subCategory: string
  productPrice: number
  status: "pending" | "approved" | "rejected"
  submittedDate?: string
  rejectionReason?: string
  hasPendingUpdateRequest?: boolean
  viewCount?: number
  actualViewCount?: number
  // 수정 요청 관련 필드들 (정규화 후에는 별도 테이블에서 관리)
  updateRequestStatus?: string
  updateRequestReason?: string
  updateRequestDate?: string
  originalProductName?: string
  originalProductContent?: string
  originalProductImage?: string
  originalProductLink?: string
  originalGenderCategory?: string
  originalMajorCategory?: string
  originalSubCategory?: string
  originalProductPrice?: number
  requestedProductName?: string
  requestedProductContent?: string
  requestedProductImage?: string
  requestedProductLink?: string
  requestedGenderCategory?: string
  requestedMajorCategory?: string
  requestedSubCategory?: string
  requestedProductPrice?: number
}

export default function PartnerProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<PartnerProduct[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'all' | 'modified'>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/partner/products", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("상품 목록 로드 실패:", error)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("정말로 이 상품을 삭제하시겠습니까?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/partner/products/${productId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        alert("상품이 삭제되었습니다.")
        loadProducts()
      } else {
        const errorText = await res.text()
        alert("삭제 실패: " + errorText)
      }
    } catch (err) {
      console.error(err)
      alert("삭제 중 오류 발생")
    }
  }
  
  const handleCancelUpdateRequest = async (productId: number) => {
    if (!confirm("수정 요청을 취소하시겠습니까?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/partner/products/${productId}/update-request/cancel`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        alert("수정 요청이 취소되었습니다.")
        loadProducts()
      } else {
        const errorText = await res.text()
        alert("취소 실패: " + errorText)
      }
    } catch (err) {
      console.error(err)
      alert("취소 중 오류 발생")
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

  const getUpdateRequestStatusBadge = (updateRequestStatus: string) => {
    switch (updateRequestStatus) {
      case "PENDING_UPDATE":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Edit className="w-3 h-3 mr-1" />
            수정 요청 대기
          </Badge>
        )
      case "APPROVED_UPDATE":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            수정 승인됨
          </Badge>
        )
      case "REJECTED_UPDATE":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            수정 거절됨
          </Badge>
        )
      default:
        return null
    }
  }
  
  // 수정된 상품만 필터링하는 함수
  const getModifiedProducts = () => {
    return products.filter(product => 
      product.updateRequestStatus === "APPROVED_UPDATE" || 
      product.updateRequestStatus === "REJECTED_UPDATE" ||
      product.updateRequestStatus === "PENDING_UPDATE"
    )
  }
  
  // 현재 탭에 따른 상품 목록
  const getCurrentProducts = () => {
    if (activeTab === 'modified') {
      return getModifiedProducts()
    }
    return products
  }

  // 필터링된 상품 목록
  const filteredProducts = getCurrentProducts().filter(product => {
    if (filterStatus === 'all') return true
    return product.status?.toLowerCase() === filterStatus.toLowerCase()
  })

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
        <h1 className="text-lg font-semibold">상품 목록</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/partner-dashboard')}
          >
            대시보드로
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push('/partner-product-upload')}
          >
            <Plus className="w-4 h-4 mr-2" />
            상품 추가
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">상품 관리</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm">상태</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">전체</option>
              <option value="pending">검토중</option>
              <option value="approved">승인</option>
              <option value="rejected">거절</option>
            </select>
          </div>
        </div>
        
        {/* 탭 UI */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            전체 상품 ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('modified')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'modified'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            수정된 상품 ({getModifiedProducts().length})
          </button>
        </div>

        {/* 상품 목록 */}
        <div className="grid gap-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">등록된 상품이 없습니다.</p>
              <Button onClick={() => router.push('/partner-product-upload')} className="mt-4">
                첫 상품 등록하기
              </Button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.productImage || "/placeholder.svg"}
                      alt={product.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{product.productName}</h3>
                      <p className="text-sm text-gray-600 mb-1">{product.productContent}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{product.genderCategory} / {product.majorCategory} / {product.subCategory}</Badge>
                        <span className="text-sm font-medium">₩{product.productPrice?.toLocaleString()}</span>
                        {typeof product.viewCount === 'number' && (
                          <span className="text-xs text-gray-600">누적 {product.viewCount.toLocaleString()}</span>
                        )}
                        {typeof product.actualViewCount === 'number' && (
                          <span className="text-xs text-gray-600">실제(12h) {product.actualViewCount.toLocaleString()}</span>
                        )}
                        {getStatusBadge(product.status)}
                        {product.updateRequestStatus && getUpdateRequestStatusBadge(product.updateRequestStatus)}
                      </div>
                      {product.status === "rejected" && product.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <Label className="text-sm font-medium text-red-800">거절 사유</Label>
                          <p className="text-sm text-red-700 mt-1">{product.rejectionReason}</p>
                        </div>
                      )}
                      {product.updateRequestStatus === "PENDING_UPDATE" && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-blue-800">수정 요청 대기 중</Label>
                          </div>
                          <table className="w-full border text-sm">
                            <thead>
                              <tr>
                                <th className="w-20 bg-gray-50">항목</th>
                                <th className="bg-gray-50">현재</th>
                                <th className="bg-gray-50">요청</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { label: "상품명", before: product.productName, after: product.requestedProductName },
                                { label: "설명", before: product.productContent, after: product.requestedProductContent },
                                { label: "카테고리", before: [product.genderCategory, product.majorCategory, product.subCategory].filter(Boolean).join(" / "), after: [product.requestedGenderCategory, product.requestedMajorCategory, product.requestedSubCategory].filter(Boolean).join(" / ") },
                                { label: "가격", before: product.productPrice?.toLocaleString(), after: product.requestedProductPrice?.toLocaleString() },
                                { label: "링크", before: product.productLink, after: product.requestedProductLink },
                              ].map(({ label, before, after }) => (
                                <tr key={label}>
                                  <td className="font-medium text-gray-700 bg-gray-50">{label}</td>
                                  <td className="px-2 py-1 border-r">{before}</td>
                                  <td className={`px-2 py-1 ${before !== after ? "bg-green-100 font-semibold" : ""}`}>{after}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {product.updateRequestStatus === "APPROVED_UPDATE" && activeTab === 'all' && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <Label className="text-sm font-medium text-green-800">수정 승인됨</Label>
                          <p className="text-sm text-green-700 mt-1">수정 요청이 승인되었습니다.</p>
                        </div>
                      )}
                      {product.updateRequestStatus === "REJECTED_UPDATE" && activeTab === 'all' && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <Label className="text-sm font-medium text-red-800">수정 거절됨</Label>
                          <p className="text-sm text-red-700 mt-1">{product.rejectionReason || "수정 요청이 거절되었습니다."}</p>
                        </div>
                      )}
                      {activeTab === 'modified' && product.updateRequestStatus === "APPROVED_UPDATE" && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <Label className="text-sm font-medium text-green-800">✓ 수정 완료</Label>
                        </div>
                      )}
                      {activeTab === 'modified' && product.updateRequestStatus === "REJECTED_UPDATE" && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <Label className="text-sm font-medium text-red-800">✗ 수정 거절</Label>
                          {product.rejectionReason && (
                            <p className="text-sm text-red-700 mt-1">사유: {product.rejectionReason}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/partner-product-upload?edit=${product.id}`)}
                        disabled={product.hasPendingUpdateRequest}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {product.hasPendingUpdateRequest && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelUpdateRequest(product.id!)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          수정 요청 취소
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id!)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
