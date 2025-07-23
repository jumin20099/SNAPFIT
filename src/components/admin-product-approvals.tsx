"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Clock, ExternalLink, ArrowLeft } from 'lucide-react'

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

interface AdminProductApprovalsProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminProductApprovals({ isOpen, onClose }: AdminProductApprovalsProps) {
  const [products, setProducts] = useState<PartnerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<PartnerProduct | null>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null)
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>('전체')
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false)
  const [partners, setPartners] = useState<Array<{id:number, companyName:string}>>([])

  useEffect(() => {
    if (isOpen) {
      loadProducts()
    }
  }, [isOpen])

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/partner/products/approvals", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      } else {
        console.error("상품 목록 로드 실패:", res.status)
      }
    } catch (error) {
      console.error("상품 목록 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPartners = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/partner/admin/applications", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        const approved = data.filter((p: any) => p.status === 'approved')
        setPartners(approved.map((p: any) => ({ id: p.id, companyName: p.companyName })))
      }
    } catch (e) { console.error(e) }
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
      const actionData = actionType === 'approve' 
        ? { action: 'approve' }
        : { action: 'reject', rejectionReason }
      
      const response = await fetch(`/api/admin/partner/products/${selectedProduct.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(actionData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      
      setIsActionDialogOpen(false)
      await loadProducts()
      
      alert(`상품이 ${actionType === 'approve' ? '승인' : '거절'}되었습니다.`)
    } catch (error) {
      console.error('Error:', error)
      alert('작업 중 오류가 발생했습니다.')
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const filteredProducts = products.filter(product => {
    if (filterStatus !== 'all' && product.status !== filterStatus) return false
    if (selectedPartnerId && product.partnerApplicationId !== selectedPartnerId) return false
    return true
  })

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
        <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">상품 승인 관리</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">로딩 중...</div>
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
          <h1 className="text-xl font-bold">상품 승인 관리</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsPartnerDialogOpen(true); loadPartners() }}>
            {selectedPartnerName} ▼
          </Button>
          <Label className="text-sm">상태 필터:</Label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">전체</option>
            <option value="pending">대기중</option>
            <option value="approved">승인</option>
            <option value="rejected">거절</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
        <p className="text-gray-600">제휴사가 등록한 상품을 승인하거나 거절할 수 있습니다. 승인된 상품은 자동으로 일반 상품 목록에 추가됩니다.</p>
      </div>

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              {filterStatus === 'all' ? '등록된 상품이 없습니다.' : `${filterStatus === 'pending' ? '대기중인' : filterStatus === 'approved' ? '승인된' : '거절된'} 상품이 없습니다.`}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.productImage || "/placeholder.svg"}
                        alt={product.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <CardTitle className="text-lg">{product.productName}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{product.productContent}</p>
                      </div>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">카테고리</Label>
                      <p className="text-sm">{product.productCategory}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">가격</Label>
                      <p className="text-sm font-semibold">{formatPrice(product.productPrice)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">제휴사</Label>
                      <p className="text-sm">
                        {product.partnerCompanyName || '알 수 없음'} (ID: {product.partnerApplicationId})
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">등록일</Label>
                      <p className="text-sm">{formatDate(product.submittedDate || product.createdAt)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">상품 링크</Label>
                      <div className="flex items-center gap-2">
                        <a 
                          href={product.productLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {product.productLink}
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(product.productLink, '_blank')}
                          className="p-1 h-6 w-6"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {product.status === "rejected" && product.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <Label className="text-sm font-medium text-red-800">거절 사유</Label>
                      <p className="text-sm text-red-700 mt-1">{product.rejectionReason}</p>
                    </div>
                  )}

                  {product.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAction(product, "approve")}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        onClick={() => handleAction(product, "reject")}
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
      </div>

      {/* 액션 다이얼로그 */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "상품 승인" : "상품 거절"}
            </DialogTitle>
            <DialogDescription>
              선택한 상품을 {actionType === "approve" ? "승인" : "거절"}합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProduct && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedProduct.productName}</strong>을(를) 
                  {actionType === "approve" ? " 승인" : " 거절"}하시겠습니까?
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
                onClick={submitAction}
                disabled={isSubmitting}
                className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {isSubmitting ? "처리 중..." : (actionType === "approve" ? "승인" : "거절")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 파트너 선택 다이얼로그 */}
      <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>제휴사 선택</DialogTitle>
            <DialogDescription>상품을 조회할 제휴사를 선택하세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <Button variant="ghost" className="justify-start w-full" onClick={() => { setSelectedPartnerId(null); setSelectedPartnerName('전체'); setIsPartnerDialogOpen(false) }}>전체</Button>
            {partners.map(p => (
              <Button key={p.id} variant="ghost" className="justify-start w-full" onClick={() => { setSelectedPartnerId(p.id); setSelectedPartnerName(p.companyName); setIsPartnerDialogOpen(false) }}>
                {p.companyName} (ID: {p.id})
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}