"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  product_content: string
  product_image: string
  product_link: string
  product_category: string
  store_mall: string
  price: string
  created_at?: string
}

interface StoreMall {
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

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  editingProduct?: Product | null
  storeMalls: StoreMall[]
}

const categories = ["상의", "하의", "아우터", "신발", "가방", "패션소품"]

export default function ProductForm({ isOpen, onClose, editingProduct, storeMalls }: ProductFormProps) {
  const [formData, setFormData] = useState({
    product_name: editingProduct?.product_name || "",
    product_content: editingProduct?.product_content || "",
    product_image: editingProduct?.product_image || "",
    product_link: editingProduct?.product_link || "",
    product_category: editingProduct?.product_category || "",
    store_mall: editingProduct?.store_mall || "",
    price: editingProduct?.price || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(editingProduct?.product_image || "")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  // selectedStore 초기값을 id 기준으로
  const [selectedStore, setSelectedStore] = useState<StoreMall | null>(null);
  const [tempSelectedStore, setTempSelectedStore] = useState<StoreMall | null>(null);

  // 상품 수정 폼이 열릴 때마다 selectedStore를 동기화
  useEffect(() => {
    if (editingProduct && storeMalls.length > 0) {
      const found = storeMalls.find(
        mall => mall.id?.toString() === editingProduct.store_mall?.toString()
      );
      setSelectedStore(found || null);
      setTempSelectedStore(found || null);
    }
  }, [editingProduct, storeMalls]);

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
    e.preventDefault();
    if (!selectedStore) {
      alert("제휴몰을 선택해야 합니다.");
      setIsSubmitting(false);
      return;
    }
    const token = localStorage.getItem("token");
    console.log("상품 등록 데이터:", formData);
    setIsSubmitting(true);
    try {
      const isEditing = editingProduct?.id;
      const url = isEditing 
        ? `/api/admin/products/${editingProduct.id}` 
        : "/api/admin/products/add";
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeIdx: selectedStore?.id, // store_mall → storeIdx
          productName: formData.product_name,
          productContent: formData.product_content,
          productPrice: Number(formData.price), // 반드시 number로 변환
          productImage: formData.product_image,
          productCategory: formData.product_category,
          productLink: formData.product_link,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("상품 처리 에러:", errorText);
        alert(isEditing ? "상품 수정 실패: " + errorText : "상품 등록 실패: " + errorText);
        return;
      }
      const data = await res.json();
      alert(isEditing ? "상품이 수정되었습니다!" : "상품이 등록되었습니다!");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "product_image");
    formData.append("refId", editingProduct?.id?.toString() || "0"); // 수정 시에는 실제 상품 ID 사용
    setUploading(true);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("업로드 에러:", errorText);
        alert("이미지 업로드 실패: " + errorText);
        return;
      }
      const { url } = await res.json();
      setImageUrl(url);
      setFormData((prev) => ({ ...prev, product_image: url }));
    } finally {
      setUploading(false);
    }
  };

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
        {/* 상단 등록 버튼 제거 */}
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

                {/* 상품 설명 */}
                <div className="space-y-2">
                  <Label htmlFor="product_name">상품 설명 *</Label>
                  <Input
                    id="product_content"
                    value={formData.product_content}
                    onChange={(e) => handleInputChange("product_content", e.target.value)}
                    placeholder="상품 설명을 입력하세요"
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
                        onChange={handleImageUpload}
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
                    type="text"
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

                {/* 제휴몰 선택 (모달 방식) */}
                <div className="space-y-2">
                  <Label htmlFor="store_mall">제휴몰 *</Label>
                  <button
                    type="button"
                    className="w-full border rounded px-4 py-2 flex items-center gap-2 bg-gray-50 hover:bg-gray-100"
                    onClick={() => {
                      setTempSelectedStore(selectedStore);
                      setIsStoreModalOpen(true);
                    }}
                  >
                    {selectedStore ? (
                      <>
                        {selectedStore.storeLogo && (
                          <img src={selectedStore.storeLogo} alt={selectedStore.storeName} style={{ width: 24, height: 24, marginRight: 8, borderRadius: 4 }} />
                        )}
                        <span>{selectedStore.storeName}</span>
                        <a href={selectedStore.storeLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 underline text-xs">{selectedStore.storeLink}</a>
                      </>
                    ) : (
                      <span className="text-gray-400">제휴몰을 선택하세요</span>
                    )}
                  </button>
                  {!selectedStore && <div className="text-red-500 text-xs mt-1">제휴몰을 선택해야 합니다.</div>}
                </div>

                {/* 제휴사 선택 모달 */}
                {isStoreModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
                      <h2 className="text-lg font-bold mb-4">제휴사 선택</h2>
                      <div className="grid gap-4">
                        {storeMalls.filter(mall => mall.isActive).map((mall) => (
                          <div
                            key={mall.id}
                            className={`flex items-center gap-4 p-3 border rounded cursor-pointer ${tempSelectedStore?.id === mall.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            onClick={() => setTempSelectedStore(mall)}
                          >
                            {mall.storeLogo && (
                              <img src={mall.storeLogo} alt={mall.storeName} style={{ width: 40, height: 40, borderRadius: 6 }} />
                            )}
                            <div>
                              <div className="font-semibold">{mall.storeName}</div>
                              <a href={mall.storeLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">{mall.storeLink}</a>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedStore(tempSelectedStore);
                            // store의 id를 저장 (백엔드에서 storeIdx로 사용)
                            setFormData(prev => ({ ...prev, store_mall: tempSelectedStore?.id?.toString() || "" }));
                            setIsStoreModalOpen(false);
                          }}
                          disabled={!tempSelectedStore}
                        >
                          적용
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsStoreModalOpen(false)}>
                          취소
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 가격 */}
                <div className="space-y-2">
                  <Label htmlFor="price">가격 *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="예: 29000"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? "등록 중..." : "등록"}
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
