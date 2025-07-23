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

interface Product {
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
          type: "일반"
        })),
        ...partnerProductsData.map((p: any) => ({
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
          type: "제휴사"
        }))
      ]
      setProducts(allProducts)
      setStoreMalls(mallsData.map((m: any) => toCamelMall(m)))
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

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      const result = await deleteProduct(productId)
      if (!result || result.success) {
        alert("삭제 성공")
        loadData()
      } else {
        alert(result.message || "삭제 실패")
      }
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

  const handleToggleProductStatus = async (productId: number, newStatus: boolean) => {
    const result = await toggleProductStatus(productId, newStatus)
    if (result.success) {
      alert(result.message)
      loadData()
    } else {
      alert(result.message)
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
            <TabsList className="w-full grid grid-cols-4 bg-transparent h-12 p-0">
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
                  <h2 className="text-2xl font-bold">상품 관리</h2>
                  <Button onClick={() => setIsProductFormOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    상품 추가
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="grid gap-4">
                    {products.map((product: Product) => {
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
                                  <Badge variant="outline">{product.product_category}</Badge>
                                  <span className="text-sm font-medium">{product.price}</span>
                                  <Badge variant="secondary">{product.type}</Badge>
                                </div>
                              </div>
                              {/* 상품 관리 탭에 활성화/비활성화 버튼 등 기존 코드 유지 */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleProductStatus(product.id!, product.status === "inactive")}
                                  className={
                                    product.status === "active"
                                    ? "text-green-600 hover:text-green-700"
                                    : "text-red-600 hover:text-red-700"
                                  }
                                >
                                  {product.status === "active" ? "활성화됨" : "비활성화됨"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id!)}
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
          </div>
        </Tabs>
      </div>
    </div>
  )
}
