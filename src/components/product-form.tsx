"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addProduct, updateProduct } from "../actions/admin-actions"

interface Product {
  id?: number
  product_name: string
  product_image: string
  product_link: string
  product_category: string
  partner_mall: string
  price: string
  created_at?: string
}

interface PartnerMall {
  id?: number
  mall_name: string
  mall_url: string
  commission_rate: number
  status: "active" | "inactive"
  created_at?: string
}

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  editingProduct?: Product | null
  partnerMalls: PartnerMall[]
}

const categories = ["상의", "하의", "아우터", "신발", "가방", "패션소품"]

export default function ProductForm({ isOpen, onClose, editingProduct, partnerMalls }: ProductFormProps) {
  const [formData, setFormData] = useState({
    product_name: editingProduct?.product_name || "",
    product_image: editingProduct?.product_image || "",
    product_link: editingProduct?.product_link || "",
    product_category: editingProduct?.product_category || "",
    partner_mall: editingProduct?.partner_mall || "",
    price: editingProduct?.price || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(editingProduct?.product_image || "")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (field === "product_image") {
      setImagePreview(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      let result
      if (editingProduct?.id) {
        result = await updateProduct(editingProduct.id, formDataObj)
      } else {
        result = await addProduct(formDataObj)
      }

      if (result.success) {
        alert(result.message)
        onClose()
      } else {
        alert("오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "product_image");

    const token = localStorage.getItem("token")
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    setUploading(true)
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        alert("인증이 필요합니다. 다시 로그인 해주세요.");
        return;
      }
      if (!res.ok) throw new Error("업로드 실패")
      const { url } = await res.json()
      setImageUrl(url)
      handleInputChange("product_image", url)
      setImagePreview(url)
    } catch (err) {
      alert("이미지 업로드 실패")
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">{editingProduct ? "상품 수정" : "상품 추가"}</h1>
        </div>
        <Button type="submit" form="product-form" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </div>

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
                  <Label htmlFor="product_name">상품명 *</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => handleInputChange("product_name", e.target.value)}
                    placeholder="상품명을 입력하세요"
                    required
                  />
                </div>

                {/* 상품 이미지 */}
                <div className="space-y-2">
                  <Label htmlFor="product_image">상품 이미지 *</Label>
                  <div className="space-y-3">
                    <Input
                      id="product_image"
                      value={formData.product_image}
                      onChange={(e) => handleInputChange("product_image", e.target.value)}
                      placeholder="이미지 URL을 입력하거나 파일을 업로드하세요"
                      required
                    />

                    {/* 파일 업로드 */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload")?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        파일 업로드
                      </Button>
                    </div>

                    {/* 이미지 미리보기 */}
                    {imagePreview && (
                      <div className="relative w-32 h-32 border rounded overflow-hidden">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="미리보기"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          onClick={() => {
                            handleInputChange("product_image", "")
                            setImagePreview("")
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 상품 링크 */}
                <div className="space-y-2">
                  <Label htmlFor="product_link">상품 링크 *</Label>
                  <Input
                    id="product_link"
                    type="url"
                    value={formData.product_link}
                    onChange={(e) => handleInputChange("product_link", e.target.value)}
                    placeholder="https://example.com/product"
                    required
                  />
                </div>

                {/* 카테고리 */}
                <div className="space-y-2">
                  <Label htmlFor="product_category">카테고리 *</Label>
                  <Select
                    value={formData.product_category}
                    onValueChange={(value) => handleInputChange("product_category", value)}
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

                {/* 제휴몰 */}
                <div className="space-y-2">
                  <Label htmlFor="partner_mall">제휴몰 *</Label>
                  <Select
                    value={formData.partner_mall}
                    onValueChange={(value) => handleInputChange("partner_mall", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="제휴몰을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {partnerMalls
                        .filter((mall) => mall.status === "active")
                        .map((mall) => (
                          <SelectItem key={mall.id} value={mall.mall_name}>
                            {mall.mall_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 가격 */}
                <div className="space-y-2">
                  <Label htmlFor="price">가격 *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="예: 29,000원"
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
