"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Edit, Trash2, Store, Package, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import ProductForm from "./product-form"
import PartnerMallForm from "./partner-mall-form"
import {
  getProducts,
  getPartnerMalls,
  deleteProduct,
  // deletePartnerMall,
  toggleProductStatus,
} from "../actions/admin-actions"

// 새로운 import 추가
import ProductAnalyticsPage from "./product-analytics"
import PartnerAnalyticsPage from "./partner-analytics"
import PartnershipApplicationsPage from "./partnership-applications"
import ProductApprovalPage from "./product-approval"

interface Product {
  id?: number
  product_name: string
  product_content: string
  product_image: string
  product_link: string
  product_category: string
  partner_mall: string
  price: string
  created_at?: string
  status?: "active" | "inactive"
}

interface PartnerMall {
  id?: number
  storeName: string
  contact: string
  storeLink: string
  commission_rate: number
  royaltyRate: number
  storeLogo: string
  status: "active" | "inactive"
  created_at?: string
}

interface AdminPageProps {
  isOpen: boolean
  onClose: () => void
}

// snake_case -> camelCase 변환 함수
function toCamelMall(mall: any): PartnerMall {
  return {
    id: mall.id,
    storeName: mall.mall_name ?? "",
    contact: mall.contact ?? "",
    storeLink: mall.mall_url ?? "",
    commission_rate: mall.commission_rate ?? 0,
    royaltyRate: mall.royaltyRate ?? 0,
    storeLogo: mall.store_logo ?? "",
    status: mall.status,
    created_at: mall.created_at,
  };
}

export default function AdminPage({ isOpen, onClose }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [products, setProducts] = useState<Product[]>([])
  const [partnerMalls, setPartnerMalls] = useState<PartnerMall[]>([])
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [isPartnerMallFormOpen, setIsPartnerMallFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingMall, setEditingMall] = useState<PartnerMall | null>(null)
  const [loading, setLoading] = useState(false)

  // 새로운 state 추가
  const [isProductAnalyticsOpen, setIsProductAnalyticsOpen] = useState(false)
  const [isPartnerAnalyticsOpen, setIsPartnerAnalyticsOpen] = useState(false)
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false)
  const [isProductApprovalOpen, setIsProductApprovalOpen] = useState(false)

  // 데이터 로드
  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, mallsData] = await Promise.all([getProducts(), getPartnerMalls()])
      setProducts(productsData.map((p: Product) => ({
        ...p,
        product_content: p.product_content ?? "",
      })))
      setPartnerMalls(mallsData.map((m: any) => toCamelMall(m)))
    } catch (error) {
      console.error("데이터 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      const result = await deleteProduct(productId)
      if (result.success) {
        alert(result.message)
        loadData()
      } else {
        alert(result.message)
      }
    }
  }

  // const handleDeleteMall = async (mallId: number) => {
  //   if (confirm("정말로 이 제휴몰을 삭제하시겠습니까?")) {
  //     const result = await deletePartnerMall(mallId)
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

  const handleEditMall = (mall: PartnerMall) => {
    setEditingMall(mall)
    setIsPartnerMallFormOpen(true)
  }

  const handleFormClose = () => {
    setIsProductFormOpen(false)
    setIsPartnerMallFormOpen(false)
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

  if (!isOpen) return null

  // 새로운 페이지 조건문들 추가
  if (isProductAnalyticsOpen) {
    return <ProductAnalyticsPage isOpen={true} onClose={() => setIsProductAnalyticsOpen(false)} />
  }

  if (isPartnerAnalyticsOpen) {
    return <PartnerAnalyticsPage isOpen={true} onClose={() => setIsPartnerAnalyticsOpen(false)} />
  }

  if (isApplicationsOpen) {
    return <PartnershipApplicationsPage isOpen={true} onClose={() => setIsApplicationsOpen(false)} />
  }

  if (isProductApprovalOpen) {
    return <ProductApprovalPage isOpen={true} onClose={() => setIsProductApprovalOpen(false)} />
  }

  // 상품 폼이 열려있으면 해당 컴포넌트 렌더링
  if (isProductFormOpen) {
    return (
      <ProductForm
        isOpen={true}
        onClose={handleFormClose}
        editingProduct={editingProduct}
        partnerMalls={partnerMalls}
      />
    )
  }

  // 제휴몰 폼이 열려있으면 해당 컴포넌트 렌더링
  if (isPartnerMallFormOpen) {
    return (
      <PartnerMallForm
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
                value="partners"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">제휴몰</span>
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
                        {partnerMalls.filter((m: PartnerMall) => m.status === "active").length}
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
                        {partnerMalls.length > 0
                          ? (partnerMalls.reduce((sum, m) => sum + m.commission_rate, 0) / partnerMalls.length).toFixed(
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
                    onClick={() => setIsPartnerAnalyticsOpen(true)}
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
                    onClick={() => setIsProductApprovalOpen(true)}
                  >
                    <CardContent className="p-4 text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                      <h3 className="font-medium">상품 승인</h3>
                      <p className="text-sm text-gray-600">상품 검토 및 승인</p>
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
                    {products.map((product: Product) => (
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
                              <p className="text-sm text-gray-600 mb-1">{product.partner_mall}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{product.product_category}</Badge>
                                <span className="text-sm font-medium">{product.price}</span>
                              </div>
                            </div>
                            {/* 상품 관리 탭에 활성화/비활성화 버튼 추가 */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleProductStatus(product.id!, product.status === "inactive")}
                                className={
                                  product.status === "active"
                                    ? "text-red-600 hover:text-red-700"
                                    : "text-green-600 hover:text-green-700"
                                }
                              >
                                {product.status === "active" ? "비활성화" : "활성화"}
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
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="partners" className="h-full m-0 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">제휴몰 관리</h2>
                  <Button onClick={() => setIsPartnerMallFormOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    제휴몰 추가
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="grid gap-4">
                    {partnerMalls.map((mall: PartnerMall) => (
                      <Card key={mall.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{mall.storeName}</h3>
                              <p className="text-sm text-gray-600 mb-2">{mall.storeLink}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant={mall.status === "active" ? "default" : "secondary"}>
                                  {mall.status === "active" ? "활성" : "비활성"}
                                </Badge>
                                <span className="text-sm">수수료: {mall.commission_rate}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditMall(mall)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  // try {
                                  //   await deletePartnerMall(mall.id!);
                                  //   alert("삭제 성공!");
                                  //   loadData(); // 목록 새로고침
                                  // } catch (e) {
                                  //   alert("삭제 실패");
                                  // }
                                }}
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
          </div>
        </Tabs>
      </div>
    </div>
  )
}
