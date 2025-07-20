"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Upload, Package, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PartnerProduct {
  id?: number
  productName: string
  productContent: string
  productImage: string
  productLink: string
  productCategory: string
  productPrice: number
  status: "pending" | "approved" | "rejected"
  submittedDate?: string
}

interface PartnerProductUploadPageProps {
  isOpen: boolean
  onClose: () => void
}

const categories = ["상의", "하의", "아우터", "신발", "가방", "패션소품"]

export default function PartnerProductUploadPage({ isOpen, onClose }: PartnerProductUploadPageProps) {
  const [products, setProducts] = useState<PartnerProduct[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<PartnerProduct | null>(null)
  const [form, setForm] = useState({
    productName: "",
    productContent: "",
    productImage: "",
    productLink: "",
    productCategory: "",
    productPrice: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
        const errorText = await res.text()
        alert("이미지 업로드 실패: " + errorText)
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
        }),
      })

      if (res.ok) {
        alert(editingProduct?.id ? "상품이 수정되었습니다!" : "상품이 등록되었습니다!")
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
      productCategory: product.productCategory,
      productPrice: product.productPrice.toString(),
    })
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
    setForm({
      productName: "",
      productContent: "",
      productImage: "",
      productLink: "",
      productCategory: "",
      productPrice: "",
    })
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

  if (!isOpen) return null

  // 상품 등록/수정 폼
  if (isFormOpen) {
    return (
      <div className="h-full flex flex-col">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
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
                    <Input
                      id="productContent"
                      value={form.productContent}
                      onChange={(e) => setForm(prev => ({ ...prev, productContent: e.target.value }))}
                      placeholder="상품 설명을 입력하세요"
                      required
                    />
                  </div>

                  {/* 상품 이미지 */}
                  <div className="space-y-2">
                    <Label htmlFor="productImage">상품 이미지 *</Label>
                    <Input
                      id="productImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      required={!form.productImage}
                    />
                    {uploading && <p className="text-sm text-gray-600">업로드 중...</p>}
                    {form.productImage && (
                      <div className="mt-2">
                        <img src={form.productImage} alt="상품 이미지" className="w-32 h-32 object-cover rounded" />
                      </div>
                    )}
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
                    <Label htmlFor="productCategory">카테고리 *</Label>
                    <Select
                      value={form.productCategory}
                      onValueChange={(value) => setForm(prev => ({ ...prev, productCategory: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
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
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">등록된 상품이 없습니다.</p>
              <Button onClick={() => setIsFormOpen(true)} className="mt-4">
                첫 상품 등록하기
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
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
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{product.productCategory}</Badge>
                          <span className="text-sm font-medium">₩{product.productPrice?.toLocaleString()}</span>
                          {getStatusBadge(product.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          disabled={product.status === "approved"}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 