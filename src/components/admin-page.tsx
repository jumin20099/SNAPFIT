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
import { getProducts, getStoreMalls, toggleProductStatus, deleteProduct } from "../actions/admin-client-fetch"

// 새로운 import 추가
import ProductAnalyticsPage from "./product-analytics"
import StoreAnalyticsPage from "./store-analytics"
import StoreApplicationsPage from "./store-applications"
import ProductApprovalPage from "./product-approval"

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
}

interface AdminStoreMall {
  id?: number
  storeIdx?: number
  storeName: string
  contact: string
  storeLink: string
  royaltyRate: number
  storeLogo: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

interface AdminPageProps {
  isOpen: boolean
  onClose: () => void
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
    isDeleted: mall.isDeleted,
    createdAt: mall.createdAt,
    updatedAt: mall.updatedAt,
  }
}

export default function AdminPage({ isOpen, onClose }: AdminPageProps) {
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

  // 데이터 로드
  const loadData = async () => {
    setLoading(true)
    console.log("loadData called");
    try {
      const [productsData, mallsData] = await Promise.all([getProducts(), getStoreMalls()])
      setProducts(productsData.map((p: any) => ({
        id: p.productIdx,
        product_name: p.productName,
        product_content: p.productContent,
        product_image: p.productImage,
        product_link: p.productLink,
        product_category: p.productCategory,
        store_mall: p.storeIdx, // 필요시 storeName 등으로 추가 매핑
        price: p.productPrice,
        created_at: p.createdAt,
        status: p.isActive ? "active" : "inactive",
      })))
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

  if (!isOpen) return null

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
                        {storeMalls.filter((m: AdminStoreMall) => !m.isDeleted).length}
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
                        {storeMalls.filter((m: AdminStoreMall) => !m.isDeleted).length > 0
                          ? (storeMalls.filter((m: AdminStoreMall) => !m.isDeleted).reduce((sum, m) => sum + m.royaltyRate, 0) / storeMalls.filter((m: AdminStoreMall) => !m.isDeleted).length).toFixed(
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
                              <p className="text-sm text-gray-600 mb-1">{product.store_mall}</p>
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

            <TabsContent value="stores" className="h-full m-0 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">제휴몰 관리</h2>
                <Button onClick={() => setIsStoreMallFormOpen(true)}>
                  + 제휴몰 추가
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-3 py-2">로고</th>
                      <th className="border px-3 py-2">이름</th>
                      <th className="border px-3 py-2">링크</th>
                      <th className="border px-3 py-2">담당자</th>
                      <th className="border px-3 py-2">로열티율</th>
                      <th className="border px-3 py-2">상태</th>
                      <th className="border px-3 py-2">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeMalls.map((mall: AdminStoreMall) => (
                      <tr key={mall.id} className="text-center">
                        <td className="border px-2 py-1">
                          {mall.storeLogo ? (
                            <img src={mall.storeLogo} alt={mall.storeName} className="w-10 h-10 object-contain mx-auto" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="border px-2 py-1 font-semibold">{mall.storeName}</td>
                        <td className="border px-2 py-1">
                          <a href={mall.storeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {mall.storeLink}
                          </a>
                        </td>
                        <td className="border px-2 py-1">{mall.contact}</td>
                        <td className="border px-2 py-1">{mall.royaltyRate ?? '-'}%</td>
                        <td className="border px-2 py-1">
                          <span className={mall.isDeleted ? 'text-gray-400' : 'text-green-600'}>
                            {mall.isDeleted ? '삭제됨' : '정상'}
                          </span>
                        </td>
                        <td className="border px-2 py-1">
                          <Button size="sm" variant="outline" onClick={() => handleEditMall(mall)}>
                            수정
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
