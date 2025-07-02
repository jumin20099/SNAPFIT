"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addPartnerMall } from "../actions/admin-actions"

interface PartnerMall {
  id?: number
  mall_name: string
  mall_url: string
  commission_rate: number
  status: "active" | "inactive"
  created_at?: string
}

interface PartnerMallFormProps {
  isOpen: boolean
  onClose: () => void
  editingMall?: PartnerMall | null
}

export default function PartnerMallForm({ isOpen, onClose, editingMall }: PartnerMallFormProps) {
  const [formData, setFormData] = useState({
    mall_name: editingMall?.mall_name || "",
    mall_url: editingMall?.mall_url || "",
    commission_rate: editingMall?.commission_rate?.toString() || "",
    status: editingMall?.status || "active",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      const result = await addPartnerMall(formDataObj)

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">{editingMall ? "제휴몰 수정" : "제휴몰 추가"}</h1>
        </div>
        <Button type="submit" form="mall-form" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>제휴몰 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="mall-form" onSubmit={handleSubmit} className="space-y-6">
                {/* 몰 이름 */}
                <div className="space-y-2">
                  <Label htmlFor="mall_name">몰 이름 *</Label>
                  <Input
                    id="mall_name"
                    value={formData.mall_name}
                    onChange={(e) => handleInputChange("mall_name", e.target.value)}
                    placeholder="제휴몰 이름을 입력하세요"
                    required
                  />
                </div>

                {/* 몰 URL */}
                <div className="space-y-2">
                  <Label htmlFor="mall_url">몰 URL *</Label>
                  <Input
                    id="mall_url"
                    type="url"
                    value={formData.mall_url}
                    onChange={(e) => handleInputChange("mall_url", e.target.value)}
                    placeholder="https://example-mall.com"
                    required
                  />
                </div>

                {/* 수수료율 */}
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">수수료율 (%) *</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => handleInputChange("commission_rate", e.target.value)}
                    placeholder="예: 5.5"
                    required
                  />
                </div>

                {/* 상태 */}
                <div className="space-y-2">
                  <Label htmlFor="status">상태 *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="상태를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
