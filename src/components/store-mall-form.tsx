import type React from "react"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StoreMall {
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

interface StoreMallFormProps {
  isOpen: boolean
  onClose: () => void
  editingMall?: StoreMall | null
}

function StoreMallForm({ isOpen, onClose, editingMall }: StoreMallFormProps) {
  const [form, setForm] = useState({
    storeName: editingMall?.storeName || "",
    storeLogo: editingMall?.storeLogo || "",
    storeLink: editingMall?.storeLink || "",
    royaltyRate: editingMall?.royaltyRate || "",
    contact: editingMall?.contact || "",
  });
  const [logoUploading, setLogoUploading] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "store_logo");
    formData.append("refId", "0"); // 신규 제휴몰은 0
    setLogoUploading(true);
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
        console.error("로고 업로드 에러:", errorText);
        alert("로고 업로드 실패: " + errorText);
        return;
      }
      const { url } = await res.json();
      setForm((prev) => ({ ...prev, storeLogo: url }));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/stores/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert("제휴몰이 등록되었습니다!");
      onClose();
    } else {
      alert("등록 실패");
    }
  };

  if (!isOpen) return null;

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
        <Button type="submit" form="mall-form" disabled={logoUploading} className="bg-blue-600 hover:bg-blue-700">
          {logoUploading ? "저장 중..." : "저장"}
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
                  <Label htmlFor="storeName">몰 이름 *</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    value={form.storeName}
                    onChange={handleChange}
                    placeholder="제휴몰 이름을 입력하세요"
                    required
                  />
                </div>

                {/* 연락처 */}
                <div className="space-y-2">
                  <Label htmlFor="contact">몰 연락처 *</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    placeholder="제휴몰 연락처를 입력하세요"
                    required
                  />
                </div>

                {/* 몰 URL */}
                <div className="space-y-2">
                  <Label htmlFor="storeLink">몰 URL *</Label>
                  <Input
                    id="storeLink"
                    name="storeLink"
                    type="url"
                    value={form.storeLink}
                    onChange={handleChange}
                    placeholder="https://example-mall.com"
                    required
                  />
                </div>

                {/* 수수료율 */}
                <div className="space-y-2">
                  <Label htmlFor="royaltyRate">수수료율 (%) *</Label>
                  <Input
                    id="royaltyRate"
                    name="royaltyRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.royaltyRate}
                    onChange={handleChange}
                    placeholder="예: 5.5"
                    required
                  />
                </div>

                {/* 로고 */}
                <div className="space-y-2">
                  <Label htmlFor="storeLogo">로고 *</Label>
                  <Input
                    id="storeLogo"
                    name="storeLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    required
                  />
                  {logoUploading && <p>로고 업로드 중...</p>}
                  {form.storeLogo && <img src={form.storeLogo} alt="로고 미리보기" style={{ maxWidth: 100 }} />}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StoreMallForm 