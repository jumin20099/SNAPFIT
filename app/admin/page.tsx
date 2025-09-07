"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Edit, Trash2, Store, Package, BarChart3, FileText, Users, CheckCircle, XCircle, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export interface Product {
  id?: number
  productIdx?: number
  product_name: string
  product_content: string
  product_image: string
  product_link: string
  product_category: string
  store_mall: string
  price: string
  created_at?: string
  status?: "active" | "inactive"
  type?: "일반" | "제휴사"
  isActive?: boolean
  isPartner?: boolean
  majorCategory: string;
  subCategory: string;
  genderCategory: string;
  updateRequestStatus?: string;
  originalProductName?: string;
  originalProductContent?: string;
  originalProductImage?: string;
  originalProductLink?: string;
  originalGenderCategory?: string;
  originalMajorCategory?: string;
  originalSubCategory?: string;
  originalProductPrice?: string;
  requestedProductName?: string;
  requestedProductContent?: string;
  requestedProductImage?: string;
  requestedProductLink?: string;
  requestedGenderCategory?: string;
  requestedMajorCategory?: string;
  requestedSubCategory?: string;
  requestedProductPrice?: string;
}

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

export default function AdminPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ role?: string; email?: string } | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [products, setProducts] = useState<Product[]>([])
  const [storeMalls, setStoreMalls] = useState<AdminStoreMall[]>([])
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<Array<{id:number, companyName:string}>>([])
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null)
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>('전체')
  const [partnerProducts, setPartnerProducts] = useState<Product[]>([])
  const [updateRequests, setUpdateRequests] = useState<Product[]>([])
  const [reports, setReports] = useState<Array<{
    reportId: number
    reporterId: string
    targetType: string
    targetId: number
    reason: string
    status: string
    createdAt: string
    adminNotes?: string
  }>>([])
  const [reportStats, setReportStats] = useState({
    pending: 0,
    processing: 0,
    resolved: 0,
    rejected: 0
  })

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch('/api/user/info', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setUserInfo(data)
            
            // ADMIN 권한이 아니면 홈으로 리다이렉트
            if (data.role !== 'ADMIN') {
              router.push('/')
            }
          }
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error)
        router.push('/')
      }
    }

    fetchUserInfo()
  }, [router])

  useEffect(() => {
    if (userInfo) {
      loadData()
    }
  }, [userInfo])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // 상품 데이터 로드
      const productsRes = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      // 제휴몰 데이터 로드
      const mallsRes = await fetch("/api/admin/store-malls", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (mallsRes.ok) {
        const mallsData = await mallsRes.json()
        setStoreMalls(mallsData)
      }

      // 제휴사 상품 데이터 로드
      const partnerProductsRes = await fetch("/api/admin/partner/products", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (partnerProductsRes.ok) {
        const partnerProductsData = await partnerProductsRes.json()
        setPartnerProducts(partnerProductsData)
      }

      // 파트너 목록 로드
      const partnersRes = await fetch("/api/partner/admin/applications", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (partnersRes.ok) {
        const apps = await partnersRes.json()
        const approved = apps.filter((a: any) => a.status === 'approved')
        setPartners(approved.map((a: any) => ({ id: a.id, companyName: a.companyName })))
      }

      // 수정 요청 목록 로드
      const updateRequestsRes = await fetch("/api/partner/admin/products/update-requests", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (updateRequestsRes.ok) {
        const data = await updateRequestsRes.json()
        setUpdateRequests(data)
      }

      // 신고 목록 로드
      const reportsRes = await fetch("/api/reports", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData)
        
        // 신고 상태별 통계 계산
        const stats = reportsData.reduce((acc: any, report: any) => {
          acc[report.status.toLowerCase()] = (acc[report.status.toLowerCase()] || 0) + 1
          return acc
        }, { pending: 0, processing: 0, resolved: 0, rejected: 0 })
        setReportStats(stats)
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: number, isPartner: boolean = false) => {
    if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        const token = localStorage.getItem("token")
        if (isPartner) {
          const res = await fetch(`/api/partner/products/${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!res.ok) {
            alert("삭제 실패")
            return
          }
        } else {
          const res = await fetch(`/api/admin/products/${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!res.ok) {
            alert("삭제 실패")
            return
          }
        }
        alert("삭제 성공")
        loadData()
      } catch (error) {
        console.error("삭제 실패:", error)
        alert("삭제 실패")
      }
    }
  }

  const handleToggleProductStatus = async (productId: number, newStatus: boolean, isPartner: boolean) => {
    try {
      if (!productId) {
        alert("상품 ID가 없습니다")
        return
      }
      
      const token = localStorage.getItem("token")
      const url = isPartner 
        ? `/api/partner/products/${productId}/status`
        : `/api/admin/products/${productId}/status`
      
      const res = await fetch(url, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          isActive: newStatus,
          status: newStatus ? 'active' : 'inactive'
        })
      })
      
      if (res.ok) {
        await loadData()
      } else {
        alert("상태 변경 실패")
      }
    } catch (error) {
      console.error("상태 변경 실패:", error)
      alert("상태 변경 실패")
    }
  }

  const handleToggleMallStatus = async (mallId: number, newStatus: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/admin/store-malls/${mallId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive: newStatus })
      })
      
      if (res.ok) {
        await loadData()
      } else {
        alert("상태 변경 실패")
      }
    } catch (error) {
      console.error("상태 변경 실패:", error)
      alert("상태 변경 실패")
    }
  }

  const handleDeleteMall = async (mallId: number) => {
    if (confirm("정말로 이 제휴몰을 삭제하시겠습니까?")) {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/admin/store-malls/${mallId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (res.ok) {
          alert("삭제 성공")
          loadData()
        } else {
          alert("삭제 실패")
        }
      } catch (error) {
        console.error("삭제 실패:", error)
        alert("삭제 실패")
      }
    }
  }

  const handleApproveUpdateRequest = async (productId: number) => {
    if (confirm("이 수정 요청을 승인하시겠습니까?")) {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/partner/admin/products/${productId}/update-request/approve`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
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
            Authorization: `Bearer ${token}`,
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

  const handleReportAction = async (reportId: number, action: 'PROCESSING' | 'RESOLVED' | 'REJECTED', adminNotes?: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: action,
          adminNotes: adminNotes || ''
        }),
      })
      
      if (res.ok) {
        alert(`신고가 ${action === 'PROCESSING' ? '처리 중으로' : action === 'RESOLVED' ? '승인' : '거절'}되었습니다.`)
        loadData()
      } else {
        alert("처리 실패")
      }
    } catch (error) {
      console.error("신고 처리 중 오류:", error)
      alert("처리 중 오류가 발생했습니다.")
    }
  }

  const handleApproveReport = (reportId: number) => {
    const adminNotes = prompt("처리 사유를 입력해주세요 (선택사항):")
    handleReportAction(reportId, 'RESOLVED', adminNotes || undefined)
  }

  const handleRejectReport = (reportId: number) => {
    const adminNotes = prompt("거절 사유를 입력해주세요:")
    if (adminNotes) {
      handleReportAction(reportId, 'REJECTED', adminNotes)
    }
  }

  if (!userInfo || userInfo.role !== 'ADMIN') {
    return null
  }

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
        <h1 className="text-lg font-semibold">관리자 페이지</h1>
        <Badge variant="secondary">Admin</Badge>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b bg-white flex-shrink-0 overflow-x-auto">
            <TabsList className="w-full flex bg-transparent h-12 p-0 min-w-max">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2 px-4 whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4" />
                <span>대시보드</span>
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2 px-4 whitespace-nowrap"
              >
                <Package className="w-4 h-4" />
                <span>상품 관리</span>
              </TabsTrigger>
              <TabsTrigger
                value="stores"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2 px-4 whitespace-nowrap"
              >
                <Store className="w-4 h-4" />
                <span>제휴몰</span>
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2 px-4 whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span>제휴 신청</span>
              </TabsTrigger>
              <TabsTrigger
                value="update-requests"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2 px-4 whitespace-nowrap"
              >
                <Edit className="w-4 h-4" />
                <span>수정 요청</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full flex items-center gap-2 px-4 whitespace-nowrap"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>신고 관리</span>
                {reportStats.pending > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 text-xs">
                    {reportStats.pending}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="dashboard" className="h-full m-0 p-4">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">대시보드</h2>

                {/* 통계 카드들 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">총 상품</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{products.length + partnerProducts.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">제휴몰</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {storeMalls.filter((m: AdminStoreMall) => m.isActive).length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">제휴사</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{partners.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">수정 요청</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{updateRequests.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">신고 처리 대기</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{reportStats.pending}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* 빠른 액션 카드들 */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push('/admin/partner-applications')}
                  >
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium">제휴 신청 관리</h3>
                      <p className="text-sm text-gray-600">신청서 검토 및 승인</p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push('/admin/product-approvals')}
                  >
                    <CardContent className="p-4 text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-green-600" />
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedPartnerId(selectedPartnerId ? null : 0)}
                    >
                      {selectedPartnerId ? selectedPartnerName : '전체'} ▼
                    </Button>
                  </div>
                  <Button onClick={() => router.push('/admin/products/add')} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    상품 추가
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="grid gap-4">
                    {(selectedPartnerId ? partnerProducts : products).map((product: Product) => {
                      const mall = storeMalls.find(m => m.id?.toString() === product.store_mall?.toString());
                      return (
                        <Card key={product.productIdx || product.id || `product-${Math.random()}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={product.product_image || "/placeholder.svg"}
                                alt={product.product_name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium">{product.product_name}</h3>
                                <p className="text-sm text-gray-600 mb-1">{mall ? mall.storeName : '-'}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {product.genderCategory || "전체"} / {product.majorCategory} / {product.subCategory}
                                  </Badge>
                                  <span className="text-sm font-medium">{product.price}</span>
                                  <Badge variant="secondary">{product.type || "일반"}</Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleProductStatus(product.productIdx || product.id || 0, !(product.isActive ?? (product.status !== 'active')), !!product.isPartner)}
                                  className={
                                    (product.isActive ?? (product.status === 'active'))
                                    ? "text-green-600 hover:text-green-700"
                                    : "text-red-600 hover:text-red-700"
                                  }
                                >
                                  {(product.isActive ?? (product.status === 'active')) ? "활성화됨" : "비활성화됨"}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => router.push(`/admin/products/edit?id=${product.productIdx || product.id}`)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.productIdx || product.id || 0, !!product.isPartner)}
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
                  <Button onClick={() => router.push('/admin/store-malls/add')}>
                    + 제휴몰 추가
                  </Button>
                </div>
                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="grid gap-4">
                    {storeMalls.map((mall: AdminStoreMall) => (
                      <Card key={mall.id || `mall-${Math.random()}`}>
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleMallStatus(mall.storeIdx!, !mall.isActive)}
                                className={
                                  mall.isActive
                                  ? "text-green-600 hover:text-green-700 border-green-200"
                                  : "text-red-600 hover:text-red-700 border-red-200"
                                }
                              >
                                {mall.isActive ? "활성화됨" : "비활성화됨"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => router.push(`/admin/store-malls/${mall.storeIdx}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMall(mall.storeIdx!)}
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
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">제휴 신청 관리 기능</p>
                      <Button 
                        onClick={() => router.push('/admin/partner-applications')} 
                        className="mt-4"
                      >
                        제휴 신청 관리 페이지로 이동
                      </Button>
                    </div>
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
                        <Card key={product.productIdx || product.id || `update-product-${Math.random()}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={product.product_image || "/placeholder.svg"}
                                alt={product.product_name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium mb-1">{product.requestedProductName || product.product_name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{product.requestedProductContent || product.product_content}</p>
                                <table className="w-full border text-sm mb-2">
                                  <thead>
                                    <tr>
                                      <th className="w-24 bg-gray-50">항목</th>
                                      <th className="bg-gray-50">수정 전</th>
                                      <th className="bg-gray-50">수정 후</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      { label: "상품명", before: product.originalProductName, after: product.requestedProductName },
                                      { label: "설명", before: product.originalProductContent, after: product.requestedProductContent },
                                      { label: "카테고리", before: [product.originalGenderCategory, product.originalMajorCategory, product.originalSubCategory].filter(Boolean).join(" / "), after: [product.requestedGenderCategory, product.requestedMajorCategory, product.requestedSubCategory].filter(Boolean).join(" / ") },
                                      { label: "가격", before: product.originalProductPrice, after: product.requestedProductPrice },
                                      { label: "링크", before: product.originalProductLink, after: product.requestedProductLink },
                                    ].map(({ label, before, after }, index) => (
                                      <tr key={`${product.id}-${label}-${index}`}>
                                        <td className="font-medium text-gray-700 bg-gray-50">{label}</td>
                                        <td className="px-2 py-1 border-r">{before}</td>
                                        <td className={`px-2 py-1 ${before !== after ? "bg-green-100 font-semibold" : ""}`}>{after}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <div className="flex flex-col gap-2 min-w-[80px]">
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

            <TabsContent value="reports" className="h-full m-0 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">신고 관리</h2>
                  <div className="flex gap-2">
                    <Badge variant="outline">전체 {reports.length}</Badge>
                    <Badge variant="destructive">대기 {reportStats.pending}</Badge>
                    <Badge variant="secondary">처리중 {reportStats.processing}</Badge>
                    <Badge variant="default">완료 {reportStats.resolved}</Badge>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="grid gap-4">
                    {reports.length === 0 ? (
                      <div className="text-center py-8">
                        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">신고가 없습니다.</p>
                      </div>
                    ) : (
                      reports.map((report) => (
                        <Card key={report.reportId || `report-${Math.random()}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge 
                                    variant={
                                      report.status === 'PENDING' ? 'destructive' :
                                      report.status === 'PROCESSING' ? 'secondary' :
                                      report.status === 'RESOLVED' ? 'default' : 'outline'
                                    }
                                  >
                                    {report.status === 'PENDING' ? '대기' :
                                     report.status === 'PROCESSING' ? '처리중' :
                                     report.status === 'RESOLVED' ? '완료' : '거절'}
                                  </Badge>
                                  <Badge variant="outline">
                                    {report.targetType === 'POST' ? '게시글' :
                                     report.targetType === 'COMMENT' ? '댓글' : '사용자'} 신고
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    #{report.reportId}
                                  </span>
                                </div>
                                
                                <h3 className="font-medium mb-1">신고 사유: {report.reason}</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  대상: {report.targetType} ID {report.targetId}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  신고자: {report.reporterId}
                                </p>
                                <p className="text-sm text-gray-500">
                                  신고일: {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                                </p>
                                
                                {report.adminNotes && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                    <strong>관리자 메모:</strong> {report.adminNotes}
                                  </div>
                                )}
                              </div>
                              
                                                                {(report.status === 'PENDING' || report.status === 'PROCESSING') && (
                                    <div className="flex flex-col gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleApproveReport(report.reportId)}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        승인
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRejectReport(report.reportId)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        거절
                                      </Button>
                                    </div>
                                  )}
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
    </div>
  )
}
