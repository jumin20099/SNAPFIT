"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Edit, Trash2, Store, Package, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import ProductForm from "./product-form"
import StoreMallForm from "./store-mall-form"
import {
  // deleteStoreMall,
} from "../actions/admin-actions"
import { getProducts, getStoreMalls, toggleProductStatus, deleteProduct, deleteStoreMall, toggleStoreStatus } from "../actions/admin-client-fetch"
import { getPartnerProducts } from "../actions/admin-actions" // 추가

// 새로운 import 추가
import ProductAnalyticsPage from "./product-analytics"
import StoreAnalyticsPage from "./store-analytics"
import StoreApplicationsPage from "./store-applications"
import ProductApprovalPage from "./product-approval"
import AdminPartnerApplications from "./admin-partner-applications"
import AdminProductApprovals from "./admin-product-approvals"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export interface Product {
  id?: number
  product_name: string
  product_content: string
  product_image: string
  product_link: string
  product_category: string
  store_mall: string
  price: string
  created_at?: string
  status?: "active" | "inactive"
  type?: "일반" | "제휴사" // 추가
  isActive?: boolean
  isPartner?: boolean
  majorCategory: string;
  subCategory: string;
  genderCategory: string;
  // 수정 요청 관련 필드들
  updateRequestStatus?: string;
  originalProductName?: string;
  originalProductContent?: string;
  originalProductImage?: string;
  originalProductLink?: string;
  originalGenderCategory?: string;
  originalMajorCategory?: string;
  originalSubCategory?: string;
  originalProductPrice?: string;
  // 수정 요청 데이터 필드들
  requestedProductName?: string;
  requestedProductContent?: string;
  requestedProductImage?: string;
  requestedProductLink?: string;
  requestedGenderCategory?: string;
  requestedMajorCategory?: string;
  requestedSubCategory?: string;
  requestedProductPrice?: string;
}

// isDeleted -> isActive로 일괄 변경
// 타입 정의
interface AdminStoreMall {
  id?: number
  storeIdx?: number
  storeName: string
  contact: string
  storeLink: string
  royaltyRate: number
  storeLogo: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

interface AdminPageProps {
  isOpen: boolean
  onClose: () => void
  userRole?: string // 추가
}

// snake_case -> camelCase 변환 함수 (Store 엔티티 기준)
function toCamelMall(mall: any): AdminStoreMall {
  return {
    id: mall.storeIdx ?? mall.id,
    storeIdx: mall.storeIdx,
    storeName: mall.storeName ?? "",
    contact: mall.contact ?? "",
    storeLink: mall.storeLink ?? "",
    royaltyRate: mall.royaltyRate ?? 0,
    storeLogo: mall.storeLogo ?? "",
    isActive: mall.isActive ?? mall.is_active,
    createdAt: mall.createdAt,
    updatedAt: mall.updatedAt,
  }
}

export default function AdminPage({ isOpen, onClose, userRole }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [products, setProducts] = useState<Product[]>([])
  const [storeMalls, setStoreMalls] = useState<AdminStoreMall[]>([])
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [isStoreMallFormOpen, setIsStoreMallFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingMall, setEditingMall] = useState<AdminStoreMall | null>(null)
  const [loading, setLoading] = useState(false)

  // 새로운 state 추가
  const [isProductAnalyticsOpen, setIsProductAnalyticsOpen] = useState(false)
  const [isStoreAnalyticsOpen, setIsStoreAnalyticsOpen] = useState(false)
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false)
  const [isProductApprovalOpen, setIsProductApprovalOpen] = useState(false)
  const [isPartnerProductApprovalOpen, setIsPartnerProductApprovalOpen] = useState(false)
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false)
  const [partners, setPartners] = useState<Array<{id:number, companyName:string}>>([])
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null)
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>('전체')
  const [partnerProducts, setPartnerProducts] = useState<Product[]>([])
  const [updateRequests, setUpdateRequests] = useState<Product[]>([])
  const [showOriginal, setShowOriginal] = useState<{ [key: number]: boolean }>({})

  // 데이터 로드
  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, mallsData, partnerProductsData] = await Promise.all([
        getProducts(),
        getStoreMalls(),
        getPartnerProducts(), // 제휴사 상품 추가
      ])
      // 기존 상품 + 제휴사 상품 합치기
      const allProducts = [
        ...productsData.map((p: any) => ({
          id: p.productIdx,
          product_name: p.productName,
          product_content: p.productContent,
          product_image: p.productImage,
          product_link: p.productLink,
          product_category: p.productCategory,
          store_mall: p.storeIdx,
          price: p.productPrice,
          created_at: p.createdAt,
          status: p.isActive ? "active" : "inactive",
          type: "일반",
          isActive: p.isActive,
          isPartner: false,
          majorCategory: p.majorCategory,
          subCategory: p.subCategory,
        })),
        ...partnerProductsData.map((p: any) => ({
          id: p.productIdx ?? p.id,
          product_name: p.productName,
          product_content: p.productContent,
          product_image: p.productImage,
          product_link: p.productLink,
          product_category: p.productCategory,
          store_mall: p.storeIdx ?? p.partnerApplicationId,
          price: p.productPrice,
          created_at: p.createdAt,
          status: p.isActive ? "active" : "inactive",
          type: "제휴사",
          isActive: p.isActive,
          isPartner: true,
          majorCategory: p.majorCategory,
          subCategory: p.subCategory,
        }))
      ]
      setProducts(allProducts)
      setStoreMalls(mallsData.map((m: any) => toCamelMall(m)))

      // 파트너 목록도 로드
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("/api/partner/admin/applications", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (res.ok) {
          const apps = await res.json()
          const approved = apps.filter((a: any) => a.status === 'approved')
          setPartners(approved.map((a: any) => ({ id: a.id, companyName: a.companyName })))
        }
      } catch(e) { console.error(e) }
      
      // 수정 요청 목록 로드
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("/api/partner/admin/products/update-requests", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          const mapped = data.map((p: any) => ({
            id: p.id,
            product_name: p.productName,
            product_content: p.productContent,
            product_image: p.productImage,
            product_link: p.productLink,
            product_category: p.productCategory,
            store_mall: p.partnerApplicationId,
            price: p.productPrice,
            created_at: p.createdAt,
            status: p.status,
            type: '제휴사',
            isActive: p.isActive,
            isPartner: true,
            majorCategory: p.majorCategory,
            subCategory: p.subCategory,
            genderCategory: p.genderCategory,
            updateRequestStatus: p.updateRequestStatus,
            originalProductName: p.originalProductName,
            originalProductContent: p.originalProductContent,
            originalProductImage: p.originalProductImage,
            originalProductLink: p.originalProductLink,
            originalGenderCategory: p.originalGenderCategory,
            originalMajorCategory: p.originalMajorCategory,
            originalSubCategory: p.originalSubCategory,
            originalProductPrice: p.originalProductPrice,
            requestedProductName: p.requestedProductName,
            requestedProductContent: p.requestedProductContent,
            requestedProductImage: p.requestedProductImage,
            requestedProductLink: p.requestedProductLink,
            requestedGenderCategory: p.requestedGenderCategory,
            requestedMajorCategory: p.requestedMajorCategory,
            requestedSubCategory: p.requestedSubCategory,
            requestedProductPrice: p.requestedProductPrice,
          }))
          setUpdateRequests(mapped)
        }
      } catch(e) { console.error(e) }
    } catch (error) {
      console.error("데이터 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("useEffect isOpen:", isOpen);
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  // 파트너 상품 로드 함수
  const fetchPartnerProducts = async (id:number) => {
    if (id) {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/admin/products/by-partner?partnerApplicationId=${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          const mapped = data.map((p: any) => ({
            id: p.productIdx ?? p.id,
            product_name: p.productName,
            product_content: p.productContent,
            product_image: p.productImage,
            product_link: p.productLink,
            product_category: p.productCategory,
            store_mall: p.storeIdx ?? p.partnerApplicationId,
            price: p.productPrice,
            created_at: p.createdAt,
            status: p.isActive ? "active" : "inactive",
            type: '제휴사',
            isActive: p.isActive,
            isPartner: true,
            majorCategory: p.majorCategory,
            subCategory: p.subCategory,
          }))
          setPartnerProducts(mapped)
        }
      } catch (e) { console.error(e) }
    } else {
      setPartnerProducts([])
    }
  }

  // 파트너 변경 시 상품 재로드
  useEffect(() => {
    if(selectedPartnerId){
      fetchPartnerProducts(selectedPartnerId)
    }
  }, [selectedPartnerId])

  const handleDeleteProduct = async (productId: number, isPartner: boolean = false) => {
    if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      if (isPartner) {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/partner/products/${productId}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) {
          alert("삭제 실패")
          return
        }
      } else {
        const result = await deleteProduct(productId)
        if (result && result.success === false) {
          alert(result.message || "삭제 실패")
          return
        }
      }
      alert("삭제 성공")
      loadData()
    }
  }

  // const handleDeleteMall = async (mallId: number) => {
  //   if (confirm("정말로 이 제휴몰을 삭제하시겠습니까?")) {
  //     const result = await deleteStoreMall(mallId)
  //     if (result.success) {
  //       alert(result.message)
  //       loadData()
  //     } else {
  //       alert(result.message)
  //     }
  //   }
  // }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsProductFormOpen(true)
  }

  const handleEditMall = (mall: AdminStoreMall) => {
    setEditingMall(mall)
    setIsStoreMallFormOpen(true)
  }

  const handleFormClose = () => {
    setIsProductFormOpen(false)
    setIsStoreMallFormOpen(false)
    setEditingProduct(null)
    setEditingMall(null)
    loadData()
  }

  const handleToggleProductStatus = async (productId: number, newStatus: boolean, isPartner:boolean) => {
    try {
      await toggleProductStatus(productId, newStatus)
      await loadData()
      if(selectedPartnerId){
        await fetchPartnerProducts(selectedPartnerId)
      }
    } catch(e:any){
      alert(e.message)
    }
  }

  const handleToggleMallStatus = async (mallId: number, newStatus: boolean) => {
    const result = await toggleStoreStatus(mallId, newStatus)
    if (result.success) {
      alert(result.message)
      loadData()
    } else {
      alert(result.message)
    }
  }

  const handleDeleteMall = async (mallId: number) => {
    if (confirm('정말로 이 제휴몰을 삭제하시겠습니까?')) {
      try {
        const result = await deleteStoreMall(mallId);
        alert('삭제 성공');
        loadData();
      } catch (e: any) {
        alert(e?.message || '삭제 실패');
      }
    }
  };

  const handleApproveUpdateRequest = async (productId: number) => {
    if (confirm("이 수정 요청을 승인하시겠습니까?")) {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/partner/admin/products/${productId}/update-request/approve`, {
          method: "PUT",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          alert("수정 요청이 승인되었습니다.")
          loadData()
        } else {
          alert("승인 실패")
        }
      } catch (error) {
        console.error("승인 중 오류:", error)
        alert("승인 중 오류가 발생했습니다.")
      }
    }
  }

  const handleRejectUpdateRequest = async (productId: number) => {
    const rejectionReason = prompt("거절 사유를 입력해주세요:")
    if (rejectionReason) {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/partner/admin/products/${productId}/update-request/reject`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ rejectionReason }),
        })
        if (res.ok) {
          alert("수정 요청이 거절되었습니다.")
          loadData()
        } else {
          alert("거절 실패")
        }
      } catch (error) {
        console.error("거절 중 오류:", error)
        alert("거절 중 오류가 발생했습니다.")
      }
    }
  }

  const toggleOriginalView = (productId: number) => {
    setShowOriginal(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

  if (!isOpen) return null
  if (userRole !== "ADMIN") {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">권한이 없습니다.</h2>
            <p className="text-gray-600">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
            <Button className="mt-4" onClick={onClose}>닫기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 새로운 페이지 조건문들 추가
  if (isProductAnalyticsOpen) {
    return <ProductAnalyticsPage isOpen={true} onClose={() => setIsProductAnalyticsOpen(false)} />
  }

  if (isStoreAnalyticsOpen) {
    return <StoreAnalyticsPage isOpen={true} onClose={() => setIsStoreAnalyticsOpen(false)} />
  }

  if (isApplicationsOpen) {
    return <StoreApplicationsPage isOpen={true} onClose={() => setIsApplicationsOpen(false)} />
  }

  if (isProductApprovalOpen) {
    return <ProductApprovalPage isOpen={true} onClose={() => setIsProductApprovalOpen(false)} />
  }

  if (isPartnerProductApprovalOpen) {
    return <AdminProductApprovals isOpen={true} onClose={() => setIsPartnerProductApprovalOpen(false)} />
  }

  // 상품 폼이 열려있으면 해당 컴포넌트 렌더링
  if (isProductFormOpen) {
    return (
      <ProductForm
        isOpen={true}
        onClose={handleFormClose}
        editingProduct={editingProduct}
        storeMalls={storeMalls}
      />
    )
  }

  // 제휴몰 폼이 열려있으면 해당 컴포넌트 렌더링
  if (isStoreMallFormOpen) {
    return (
      <StoreMallForm
        isOpen={true}
        onClose={handleFormClose}
        editingMall={editingMall ? toCamelMall(editingMall) : undefined}
      />
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
          <div className="font-bold text-xl">관리자 페이지</div>
        </div>
        <Badge variant="secondary">Admin</Badge>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b bg-white flex-shrink-0">
            <TabsList className="w-full grid grid-cols-5 bg-transparent h-12 p-0">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">대시보드</span>
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">상품 관리</span>
              </TabsTrigger>
              <TabsTrigger
                value="stores"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">제휴몰</span>
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">제휴 신청</span>
              </TabsTrigger>
              <TabsTrigger
                value="update-requests"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">수정 요청</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="dashboard" className="h-full m-0 p-4">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">대시보드</h2>

                {/* 통계 카드들 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">총 상품</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">제휴몰</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {storeMalls.filter((m: AdminStoreMall) => !m.isActive).length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">카테고리</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{new Set(products.map((p: Product) => p.product_category)).size}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">평균 수수료</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {storeMalls.filter((m: AdminStoreMall) => !m.isActive).length > 0
                          ? (storeMalls.filter((m: AdminStoreMall) => !m.isActive).reduce((sum, m) => sum + m.royaltyRate, 0) / storeMalls.filter((m: AdminStoreMall) => !m.isActive).length).toFixed(
                              1,
                            )
                          : 0}
                        %
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 대시보드 탭에 새로운 카드들 추가 */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setIsProductAnalyticsOpen(true)}
                  >
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium">상품 분석</h3>
                      <p className="text-sm text-gray-600">매출, 조회수, 전환율</p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setIsStoreAnalyticsOpen(true)}
                  >
                    <CardContent className="p-4 text-center">
                      <Store className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-medium">제휴사 분석</h3>
                      <p className="text-sm text-gray-600">매출, 수수료, 납부현황</p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setIsApplicationsOpen(true)}
                  >
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-medium">제휴 신청</h3>
                      <p className="text-sm text-gray-600">신청서 검토 및 승인</p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setIsPartnerProductApprovalOpen(true)}
                  >
                    <CardContent className="p-4 text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                      <h3 className="font-medium">제휴사 상품 승인</h3>
                      <p className="text-sm text-gray-600">제휴사 상품 검토 및 승인</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="h-full m-0 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">상품 관리</h2>
                    <Button variant="outline" size="sm" onClick={() => { setIsPartnerDialogOpen(true) }}>
                      {selectedPartnerName} ▼
                    </Button>
                  </div>
                  <Button onClick={() => setIsProductFormOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    상품 추가
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="grid gap-4">
                    { (selectedPartnerId ? partnerProducts : products).filter(p=>true).map((product: Product) => {
                      const mall = storeMalls.find(m => m.id?.toString() === product.store_mall?.toString());
                      return (
                        <Card key={product.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={product.product_image || "/placeholder.svg"}
                                alt={product.product_name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium">{product.product_name}</h3>
                                {/* 제휴몰 이름 표시 */}
                                <p className="text-sm text-gray-600 mb-1">{mall ? mall.storeName : '-'}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{product.genderCategory ? product.genderCategory : "전체"} / {product.majorCategory} / {product.subCategory}</Badge>
                                  <span className="text-sm font-medium">{product.price}</span>
                                  <Badge variant="secondary">{product.type}</Badge>
                                </div>
                              </div>
                              {/* 상품 관리 탭에 활성화/비활성화 버튼 등 기존 코드 유지 */}
                              <div className="flex items-center gap-2">
                                  <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleToggleProductStatus(product.id!, !(product.isActive ?? (product.status !== 'active')), !!product.isPartner)}
                                       className={
                                         (product.isActive ?? (product.status === 'active'))
                                         ? "text-green-600 hover:text-green-700"
                                         : "text-red-600 hover:text-red-700"
                                       }
                                     >
                                       {(product.isActive ?? (product.status === 'active')) ? "활성화됨" : "비활성화됨"}
                                     </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id!, !!product.isPartner)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stores" className="h-full m-0 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">제휴몰 관리</h2>
                  <Button onClick={() => setIsStoreMallFormOpen(true)}>
                    + 제휴몰 추가
                  </Button>
                </div>
                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="grid gap-4">
                    {storeMalls.map((mall: AdminStoreMall) => (
                      <Card key={mall.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={mall.storeLogo || "/placeholder.svg"}
                              alt={mall.storeName}
                              className="w-16 h-16 object-contain rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium">{mall.storeName}</h3>
                              <a href={mall.storeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">{mall.storeLink}</a>
                              <div className="text-sm text-gray-600 mt-1">담당자: {mall.contact || '-'}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">로열티율: {mall.royaltyRate ?? '-'}%</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* 상태 변경 버튼 */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleMallStatus(mall.id!, !mall.isActive)}
                                className={
                                  !mall.isActive
                                  ? "text-red-600 hover:text-red-700 border-red-200"
                                    : "text-green-600 hover:text-green-700 border-green-200"
                                }
                              >
                                {!mall.isActive ? "비활성화됨" : "활성화됨"}
                              </Button>
                              {/* 수정 버튼 */}
                              <Button size="sm" variant="outline" onClick={() => handleEditMall(mall)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              {/* 삭제 버튼 */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMall(mall.id!)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="applications" className="h-full m-0 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">제휴 신청 관리</h2>
                </div>
                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="grid gap-4">
                    <AdminPartnerApplications />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="update-requests" className="h-full m-0 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">수정 요청 관리</h2>
                </div>
                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="grid gap-4">
                    {updateRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">수정 요청이 없습니다.</p>
                      </div>
                    ) : (
                      updateRequests.map((product: Product) => (
                        <Card key={product.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={product.product_image || "/placeholder.svg"}
                                alt={product.product_name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium">{product.product_name}</h3>
                                <p className="text-sm text-gray-600 mb-1">{product.product_content}</p>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">{product.genderCategory ? product.genderCategory : "전체"} / {product.majorCategory} / {product.subCategory}</Badge>
                                  <span className="text-sm font-medium">{product.price}</span>
                                  <Badge variant="secondary">{product.type}</Badge>
                                </div>
                                
                                {showOriginal[product.id!] ? (
                                  <div className="text-sm space-y-1">
                                    <div className="p-2 bg-gray-50 rounded border">
                                      <p className="font-medium text-gray-800 mb-2">원본 데이터</p>
                                      <p><strong>상품명:</strong> <span className="bg-yellow-100 px-1 rounded">{product.originalProductName}</span></p>
                                      <p><strong>설명:</strong> <span className="bg-yellow-100 px-1 rounded">{product.originalProductContent}</span></p>
                                      <p><strong>카테고리:</strong> <span className="bg-yellow-100 px-1 rounded">{product.originalGenderCategory} / {product.originalMajorCategory} / {product.originalSubCategory}</span></p>
                                      <p><strong>가격:</strong> <span className="bg-yellow-100 px-1 rounded">₩{product.originalProductPrice}</span></p>
                                      <p><strong>링크:</strong> <span className="bg-yellow-100 px-1 rounded">{product.originalProductLink}</span></p>
                                    </div>
                                    <div className="p-2 bg-blue-50 rounded border">
                                      <p className="font-medium text-blue-800 mb-2">수정 요청 데이터</p>
                                      <p><strong>상품명:</strong> <span className="bg-green-100 px-1 rounded">{product.requestedProductName}</span></p>
                                      <p><strong>설명:</strong> <span className="bg-green-100 px-1 rounded">{product.requestedProductContent}</span></p>
                                      <p><strong>카테고리:</strong> <span className="bg-green-100 px-1 rounded">{product.requestedGenderCategory} / {product.requestedMajorCategory} / {product.requestedSubCategory}</span></p>
                                      <p><strong>가격:</strong> <span className="bg-green-100 px-1 rounded">₩{product.requestedProductPrice}</span></p>
                                      <p><strong>링크:</strong> <span className="bg-green-100 px-1 rounded">{product.requestedProductLink}</span></p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    <p><strong>원본:</strong> {product.originalProductName}</p>
                                    <p><strong>수정 요청:</strong> {product.requestedProductName}</p>
                                    <p><strong>원본 가격:</strong> ₩{product.originalProductPrice}</p>
                                    <p><strong>요청 가격:</strong> ₩{product.requestedProductPrice}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleOriginalView(product.id!)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  {showOriginal[product.id!] ? "간단 보기" : "원본 보기"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApproveUpdateRequest(product.id!)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  승인
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectUpdateRequest(product.id!)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  거절
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* 파트너 선택 다이얼로그 */}
      {isPartnerDialogOpen && (
        <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>제휴사 선택</DialogTitle>
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
      )}
    </div>
  )
}
