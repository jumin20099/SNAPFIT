'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'

interface Product {
  id?: number
  productIdx?: number
  productName: string
  productContent: string
  productImage: string
  productLink: string
  productCategory: string
  storeMall: string
  productPrice: number
  majorCategory: string
  subCategory: string
  genderCategory: string
  isActive?: boolean
}

export default function EditProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('id')
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        credentials: 'include' // HttpOnly 쿠키 자동 전송
      })
      
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        setImagePreview(data.productImage || '')
      } else {
        alert('상품을 불러올 수 없습니다')
        router.push('/admin')
      }
    } catch (error) {
      console.error('상품 로딩 실패:', error)
      alert('상품을 불러올 수 없습니다')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!product) return
    
    setSaving(true)
    try {
      // HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가
      // 서버에서 자동으로 인증 처리
      let updatedProduct = { ...product }
      
      // 이미지 파일이 있으면 업로드
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('purpose', 'product_image')
        formData.append('refId', productId || '0')
        
        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          credentials: 'include', // HttpOnly 쿠키 자동 전송
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          updatedProduct.productImage = uploadData.url
        } else {
          const errorData = await uploadResponse.json()
          alert(`이미지 업로드에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`)
          return
        }
      }
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // HttpOnly 쿠키 자동 전송
        body: JSON.stringify(updatedProduct)
      })
      
      if (response.ok) {
        alert('상품이 수정되었습니다')
        router.push('/admin')
      } else {
        alert('상품 수정에 실패했습니다')
      }
    } catch (error) {
      console.error('상품 수정 실패:', error)
      alert('상품 수정에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Product, value: string | number) => {
    if (product) {
      setProduct({ ...product, [field]: value })
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

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">상품을 찾을 수 없습니다</div>
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
        <h1 className="text-2xl font-bold">상품 수정</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상품 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productName">상품명</Label>
              <Input
                id="productName"
                value={product.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="productPrice">가격</Label>
              <Input
                id="productPrice"
                type="number"
                value={product.productPrice}
                onChange={(e) => handleInputChange('productPrice', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="majorCategory">대분류</Label>
              <Input
                id="majorCategory"
                value={product.majorCategory}
                onChange={(e) => handleInputChange('majorCategory', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subCategory">소분류</Label>
              <Input
                id="subCategory"
                value={product.subCategory}
                onChange={(e) => handleInputChange('subCategory', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="genderCategory">성별</Label>
              <Input
                id="genderCategory"
                value={product.genderCategory}
                onChange={(e) => handleInputChange('genderCategory', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="productLink">상품 링크</Label>
              <Input
                id="productLink"
                value={product.productLink}
                onChange={(e) => handleInputChange('productLink', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="productContent">상품 설명</Label>
            <Textarea
              id="productContent"
              value={product.productContent}
              onChange={(e) => handleInputChange('productContent', e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="productImage">상품 이미지</Label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="상품 미리보기" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Input
                id="productImage"
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

