"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Upload, Package, Edit, Trash2, CheckCircle, XCircle, Clock, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_MAP, GenderCategory, MajorCategory, SubCategory } from "@/constants/category-map"
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
  // 뷰 지표(제휴사용 노출)
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

export default function PartnerProductUploadPage() {
  const router = useRouter()
  const [products, setProducts] = useState<PartnerProduct[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<PartnerProduct | null>(null)
  const [form, setForm] = useState({
    productName: "",
    productContent: "",
    productImage: "",
    productLink: "",
    genderCategory: "전체",
    majorCategory: "",
    subCategory: "",
    productPrice: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [showOriginal, setShowOriginal] = useState<{ [key: number]: boolean }>({})
  const [activeTab, setActiveTab] = useState<'all' | 'modified'>('all')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token")
      const res = await fetch('/api/user/info', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setUserInfo(data)
      }
    }
    fetchUserInfo()
    loadProducts()
    
    // URL 파라미터에서 edit 모드 확인
    const urlParams = new URLSearchParams(window.location.search)
    const editProductId = urlParams.get('edit')
    if (editProductId) {
      // 상품 수정 모드로 진입
      const productId = parseInt(editProductId)
      if (!isNaN(productId)) {
        // 상품 정보를 로드한 후 수정 모드로 전환
        const loadProductForEdit = async () => {
          try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/partner/products/${productId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            if (res.ok) {
              const product = await res.json()
              setEditingProduct(product)
              setForm({
                productName: product.productName,
                productContent: product.productContent,
                productImage: product.productImage,
                productLink: product.productLink,
                genderCategory: product.genderCategory,
                majorCategory: product.majorCategory,
                subCategory: product.subCategory,
                productPrice: product.productPrice.toString(),
              })
              setImagePreview(product.productImage || "")
              setIsFormOpen(true)
            }
          } catch (error) {
            console.error("상품 정보 로드 실패:", error)
          }
        }
        loadProductForEdit()
      }
    }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 미리보기 설정
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("purpose", "product_image")
    formData.append("refId", editingProduct?.id?.toString() || "0")

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
        const errorData = await res.json()
        alert(`이미지 업로드 실패: ${errorData.error || '알 수 없는 오류'}`)
        return
      }
      const { url } = await res.json()
      setForm(prev => ({ ...prev, productImage: url }))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const url = editingProduct?.id 
        ? `/api/partner/products/${editingProduct.id}`
        : "/api/partner/products"
      const method = editingProduct?.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          productPrice: Number(form.productPrice),
          productCategory: form.majorCategory, // product_category를 major_category로 설정
          partnerApplicationId: userInfo?.partner_application_id ? Number(userInfo.partner_application_id) : undefined,
          storeIdx: userInfo?.store_idx || 4,  // store_idx 추가 (기본값: 주민컴퍼니)
        }),
      })

      if (res.ok) {
        alert(editingProduct?.id ? "상품이 수정되었습니다!" : "상품이 등록되었습니다!")
        // URL에서 edit 파라미터 제거
        if (window.history.pushState) {
          const newUrl = window.location.pathname
          window.history.pushState({}, '', newUrl)
        }
        handleFormClose()
        loadProducts()
      } else {
        const errorText = await res.text()
        alert("상품 등록 실패: " + errorText)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduct = (product: PartnerProduct) => {
    setEditingProduct(product)
    setForm({
      productName: product.productName,
      productContent: product.productContent,
      productImage: product.productImage,
      productLink: product.productLink,
      genderCategory: product.genderCategory,
      majorCategory: product.majorCategory,
      subCategory: product.subCategory,
      productPrice: product.productPrice.toString(),
    })
    setImagePreview(product.productImage || "")
    setIsFormOpen(true)
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

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
    setForm({
      productName: "",
      productContent: "",
      productImage: "",
      productLink: "",
      genderCategory: "전체",
      majorCategory: "",
      subCategory: "",
      productPrice: "",
    })
    setImageFile(null)
    setImagePreview("")
    // URL에서 edit 파라미터 제거
    if (window.history.pushState) {
      const newUrl = window.location.pathname
      window.history.pushState({}, '', newUrl)
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

  const toggleOriginalView = (productId: number) => {
    setShowOriginal(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
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

  // 상품 등록/수정 폼
  if (isFormOpen) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFormClose}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {editingProduct?.id ? "상품 수정" : "상품 등록"}
          </h1>
          <div></div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>상품 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* 상품명 */}
                  <div className="space-y-2">
                    <Label htmlFor="productName">상품명 *</Label>
                    <Input
                      id="productName"
                      value={form.productName}
                      onChange={(e) => setForm(prev => ({ ...prev, productName: e.target.value }))}
                      placeholder="상품명을 입력하세요"
                      required
                    />
                  </div>

                  {/* 상품 설명 */}
                  <div className="space-y-2">
                    <Label htmlFor="productContent">상품 설명 *</Label>
                    <Textarea
                      id="productContent"
                      value={form.productContent}
                      onChange={(e) => setForm(prev => ({ ...prev, productContent: e.target.value }))}
                      placeholder="상품 설명을 입력하세요"
                      rows={4}
                      required
                    />
                  </div>

                  {/* 상품 이미지 */}
                  <div className="space-y-4">
                    <Label htmlFor="productImage">상품 이미지 *</Label>
                    <div className="space-y-4">
                      {(imagePreview || form.productImage) && (
                        <div className="w-32 h-32 border rounded-lg overflow-hidden">
                          <img 
                            src={imagePreview || form.productImage} 
                            alt="상품 미리보기" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Input
                        id="productImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required={!form.productImage}
                      />
                      {uploading && <p className="text-sm text-gray-600">업로드 중...</p>}
                      <p className="text-sm text-gray-500">JPG, PNG, GIF 파일만 업로드 가능합니다.</p>
                    </div>
                  </div>

                  {/* 상품 링크 */}
                  <div className="space-y-2">
                    <Label htmlFor="productLink">상품 링크 *</Label>
                    <Input
                      id="productLink"
                      type="url"
                      value={form.productLink}
                      onChange={(e) => setForm(prev => ({ ...prev, productLink: e.target.value }))}
                      placeholder="https://example.com/product"
                      required
                    />
                  </div>

                  {/* 카테고리 */}
                  <div className="space-y-2">
                    {/* 성별 */}
                    <Label>성별 *</Label>
                    <Select
                      value={form.genderCategory}
                      onValueChange={(val) => {
                        setForm(prev => ({ 
                          ...prev, 
                          genderCategory: val,
                          majorCategory: "",
                          subCategory: ""
                        }))
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="성별"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="전체">전체</SelectItem>
                        <SelectItem value="남성">남성</SelectItem>
                        <SelectItem value="여성">여성</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* 대분류 */}
                    <Label>대분류 *</Label>
                    <Select
                      value={form.majorCategory}
                      onValueChange={(val) => {
                        setForm(prev => ({ 
                          ...prev, 
                          majorCategory: val,
                          subCategory: ""
                        }))
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="대분류"/></SelectTrigger>
                      <SelectContent>
                        {Object.keys(CATEGORY_MAP[form.genderCategory as GenderCategory] || {}).map(major => (
                          <SelectItem key={major} value={major}>{major}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* 세분류 */}
                    <Label>세분류 *</Label>
                    <Select
                      value={form.subCategory}
                      onValueChange={(val) => setForm(prev => ({ ...prev, subCategory: val }))}
                    >
                      <SelectTrigger><SelectValue placeholder="세분류"/></SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {form.majorCategory && CATEGORY_MAP[form.genderCategory as GenderCategory]?.[form.majorCategory as MajorCategory]?.map((sub: SubCategory) => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 가격 */}
                  <div className="space-y-2">
                    <Label htmlFor="productPrice">가격 *</Label>
                    <Input
                      id="productPrice"
                      type="number"
                      min="0"
                      value={form.productPrice}
                      onChange={(e) => setForm(prev => ({ ...prev, productPrice: e.target.value }))}
                      placeholder="예: 29000"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                      {isSubmitting ? "등록 중..." : (editingProduct?.id ? "수정" : "등록")}
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

  // 필터링된 상품 목록
  const filteredProducts = getCurrentProducts().filter(product => {
    if (filterStatus === 'all') return true
    return product.status?.toLowerCase() === filterStatus.toLowerCase()
  })

  // 상품 목록 상단에 탭과 필터 UI 추가
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
        <h1 className="text-lg font-semibold">상품 관리</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/partner-dashboard')}
        >
          대시보드로
        </Button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">상품 목록</h2>
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
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setEditingProduct(null);
                setForm({
                  productName: "",
                  productContent: "",
                  productImage: "",
                  productLink: "",
                  genderCategory: "전체",
                  majorCategory: "",
                  subCategory: "",
                  productPrice: "",
                });
                setImageFile(null);
                setImagePreview("");
                setIsFormOpen(true);
              }}
            >
              상품 추가
            </Button>
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

        {/* 상품 목록 렌더링 시 filteredProducts 사용 */}
        <div className="grid gap-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">등록된 상품이 없습니다.</p>
              <Button onClick={() => setIsFormOpen(true)} className="mt-4">
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
                              {/* 이미지 비교 */}
                              <tr>
                                <td className="font-medium text-gray-700 bg-gray-50">이미지</td>
                                <td className="px-2 py-1 border-r">
                                  {product.productImage ? (
                                    <img 
                                      src={product.productImage} 
                                      alt="현재 이미지" 
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  ) : (
                                    <span className="text-gray-400">없음</span>
                                  )}
                                </td>
                                <td className={`px-2 py-1 ${product.productImage !== product.requestedProductImage ? "bg-green-100 font-semibold" : ""}`}>
                                  {product.requestedProductImage ? (
                                    <img 
                                      src={product.requestedProductImage} 
                                      alt="요청 이미지" 
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  ) : (
                                    <span className="text-gray-400">없음</span>
                                  )}
                                </td>
                              </tr>
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
                        onClick={() => handleEditProduct(product)}
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
