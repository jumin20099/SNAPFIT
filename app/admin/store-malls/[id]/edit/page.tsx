'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'

interface StoreMall {
  storeIdx?: number
  storeName: string
  contact: string
  storeLink: string
  royaltyRate: number
  storeLogo: string
  isActive?: boolean
}

export default function EditStoreMallPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id
  
  const [storeMall, setStoreMall] = useState<StoreMall | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    if (storeId) {
      loadStoreMall()
    }
  }, [storeId])

  const loadStoreMall = async () => {
    try {
      const response = await fetch(`/api/admin/store-malls/${storeId}`, {
        credentials: 'include' // HttpOnly 쿠키 자동 전송
      })
      
      if (response.ok) {
        const data = await response.json()
        setStoreMall(data)
        setImagePreview(data.storeLogo || '')
      } else {
        alert('스토어몰을 불러올 수 없습니다')
        router.push('/admin')
      }
    } catch (error) {
      console.error('스토어몰 로딩 실패:', error)
      alert('스토어몰을 불러올 수 없습니다')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!storeMall) return
    
    setSaving(true)
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리
      let updatedStoreMall = { ...storeMall }
      
      // 이미지 파일이 있으면 업로드
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('purpose', 'store_logo')
        formData.append('refId', storeId as string)
        
        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          credentials: 'include', // HttpOnly 쿠키 자동 전송
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          updatedStoreMall.storeLogo = uploadData.url
        } else {
          const errorData = await uploadResponse.json()
          alert(`이미지 업로드에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`)
          return
        }
      }
      
      const response = await fetch(`/api/admin/store-malls/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // HttpOnly 쿠키 자동 전송
        body: JSON.stringify(updatedStoreMall)
      })
      
      if (response.ok) {
        alert('스토어몰이 수정되었습니다')
        router.push('/admin')
      } else {
        alert('스토어몰 수정에 실패했습니다')
      }
    } catch (error) {
      console.error('스토어몰 수정 실패:', error)
      alert('스토어몰 수정에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof StoreMall, value: string | number | boolean) => {
    if (storeMall) {
      setStoreMall({ ...storeMall, [field]: value })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!storeMall) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">스토어몰을 찾을 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-2xl font-bold">스토어몰 수정</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>스토어몰 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeName">스토어명</Label>
              <Input
                id="storeName"
                value={storeMall.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact">연락처</Label>
              <Input
                id="contact"
                value={storeMall.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="storeLink">스토어 링크</Label>
              <Input
                id="storeLink"
                value={storeMall.storeLink}
                onChange={(e) => handleInputChange('storeLink', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="royaltyRate">로열티 비율 (%)</Label>
              <Input
                id="royaltyRate"
                type="number"
                value={storeMall.royaltyRate}
                onChange={(e) => handleInputChange('royaltyRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="storeLogo">스토어 로고</Label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="로고 미리보기" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Input
                id="storeLogo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500">JPG, PNG, GIF 파일만 업로드 가능합니다.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
