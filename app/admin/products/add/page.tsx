'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'

interface Product {
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

export default function AddProductPage() {
  const router = useRouter()
  
  const [product, setProduct] = useState<Product>({
    productName: '',
    productContent: '',
    productImage: '',
    productLink: '',
    productCategory: '의류',
    storeMall: 'SnapFit Store',
    productPrice: undefined as any,
    majorCategory: '',
    subCategory: '',
    genderCategory: '',
    isActive: true
  })
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      let newProduct = { ...product }
      
      // 이미지 파일이 있으면 업로드
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('purpose', 'product_image')
        formData.append('refId', '0') // 새 상품이므로 0
        
        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          newProduct.productImage = uploadData.url
        } else {
          const errorData = await uploadResponse.json()
          alert(`이미지 업로드에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`)
          return
        }
      }
      
      const response = await fetch('/api/admin/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      })
      
      if (response.ok) {
        alert('상품이 추가되었습니다')
        router.push('/admin')
      } else {
        const errorData = await response.json()
        alert(`상품 추가에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('상품 추가 실패:', error)
      alert('상품 추가에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Product, value: string | number | boolean) => {
    if (field === 'majorCategory') {
      // 대분류가 변경되면 소분류 초기화
      setProduct({ ...product, [field]: value as string, subCategory: '' })
    } else {
      setProduct({ ...product, [field]: value as string })
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
        <h1 className="text-2xl font-bold">상품 추가</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상품 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productName">상품명 *</Label>
              <Input
                id="productName"
                value={product.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="상품명을 입력하세요"
                required
              />
            </div>
            <div>
              <Label htmlFor="productPrice">가격 *</Label>
              <Input
                id="productPrice"
                type="number"
                value={product.productPrice || ''}
                onChange={(e) => handleInputChange('productPrice', parseInt(e.target.value) || 0)}
                placeholder="가격을 입력하세요"
                required
              />
            </div>
            <div>
              <Label htmlFor="majorCategory">대분류 *</Label>
              <select
                id="majorCategory"
                value={product.majorCategory}
                onChange={(e) => handleInputChange('majorCategory', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">대분류를 선택하세요</option>
                <option value="신발">신발</option>
                <option value="상의">상의</option>
                <option value="아우터">아우터</option>
                <option value="바지">바지</option>
                <option value="원피스/스커트">원피스/스커트</option>
                <option value="가방">가방</option>
                <option value="패션소품">패션소품</option>
              </select>
            </div>
            <div>
              <Label htmlFor="subCategory">소분류 *</Label>
              <select
                id="subCategory"
                value={product.subCategory}
                onChange={(e) => handleInputChange('subCategory', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">소분류를 선택하세요</option>
                {product.majorCategory === '신발' && (
                  <>
                    <option value="신상">신상</option>
                    <option value="스니커즈">스니커즈</option>
                    <option value="패딩/퍼 신발">패딩/퍼 신발</option>
                    <option value="부츠/워커">부츠/워커</option>
                    <option value="구두">구두</option>
                    <option value="샌들/슬리퍼">샌들/슬리퍼</option>
                    <option value="스포츠화">스포츠화</option>
                    <option value="신발용품">신발용품</option>
                  </>
                )}
                {product.majorCategory === '상의' && (
                  <>
                    <option value="신상">신상</option>
                    <option value="맨투맨/스웨트">맨투맨/스웨트</option>
                    <option value="후드 티셔츠">후드 티셔츠</option>
                    <option value="셔츠/블라우스">셔츠/블라우스</option>
                    <option value="긴소매 티셔츠">긴소매 티셔츠</option>
                    <option value="반소매 티셔츠">반소매 티셔츠</option>
                    <option value="피케/카라 티셔츠">피케/카라 티셔츠</option>
                    <option value="니트/스웨터">니트/스웨터</option>
                    <option value="민소매 티셔츠">민소매 티셔츠</option>
                    <option value="기타 상의">기타 상의</option>
                  </>
                )}
                {product.majorCategory === '아우터' && (
                  <>
                    <option value="신상">신상</option>
                    <option value="후드 집업">후드 집업</option>
                    <option value="블루종/MA-1">블루종/MA-1</option>
                    <option value="레더/라이더스 재킷">레더/라이더스 재킷</option>
                    <option value="카디건">카디건</option>
                    <option value="트러커 재킷">트러커 재킷</option>
                    <option value="슈트/블레이저 재킷">슈트/블레이저 재킷</option>
                    <option value="스타디움 재킷">스타디움 재킷</option>
                    <option value="나일론/코치 재킷">나일론/코치 재킷</option>
                    <option value="아노락 재킷">아노락 재킷</option>
                    <option value="트레이닝 재킷">트레이닝 재킷</option>
                    <option value="환절기 코트">환절기 코트</option>
                    <option value="사파리/헌팅 재킷">사파리/헌팅 재킷</option>
                    <option value="베스트">베스트</option>
                    <option value="숏패딩/헤비 아우터">숏패딩/헤비 아우터</option>
                    <option value="무스탕/퍼">무스탕/퍼</option>
                    <option value="플리스/뽀글이">플리스/뽀글이</option>
                    <option value="겨울 싱글 코트">겨울 싱글 코트</option>
                    <option value="겨울 더블 코트">겨울 더블 코트</option>
                    <option value="겨울 기타 코트">겨울 기타 코트</option>
                    <option value="롱패딩/헤비 아우터">롱패딩/헤비 아우터</option>
                    <option value="패딩 베스트">패딩 베스트</option>
                    <option value="기타 아우터">기타 아우터</option>
                  </>
                )}
                {product.majorCategory === '바지' && (
                  <>
                    <option value="신상">신상</option>
                    <option value="데님 팬츠">데님 팬츠</option>
                    <option value="트레이닝/조거 팬츠">트레이닝/조거 팬츠</option>
                    <option value="코튼 팬츠">코튼 팬츠</option>
                    <option value="슈트 팬츠/슬랙스">슈트 팬츠/슬랙스</option>
                    <option value="숏 팬츠">숏 팬츠</option>
                    <option value="레깅스">레깅스</option>
                    <option value="점프 슈트/오버올">점프 슈트/오버올</option>
                    <option value="기타 하의">기타 하의</option>
                  </>
                )}
                {product.majorCategory === '원피스/스커트' && (
                  <>
                    <option value="신상">신상</option>
                    <option value="미니원피스">미니원피스</option>
                    <option value="미디원피스">미디원피스</option>
                    <option value="맥시원피스">맥시원피스</option>
                    <option value="미니스커트">미니스커트</option>
                    <option value="미디스커트">미디스커트</option>
                    <option value="롱스커트">롱스커트</option>
                  </>
                )}
                {product.majorCategory === '가방' && (
                  <>
                    <option value="신상">신상</option>
                    <option value="메신저/크로스 백">메신저/크로스 백</option>
                    <option value="숄더백">숄더백</option>
                    <option value="백팩">백팩</option>
                    <option value="토트백">토트백</option>
                    <option value="에코백">에코백</option>
                    <option value="보스턴/더플백">보스턴/더플백</option>
                    <option value="웨이스트 백">웨이스트 백</option>
                    <option value="파우치 백">파우치 백</option>
                    <option value="브리프 케이스">브리프 케이스</option>
                    <option value="캐리어">캐리어</option>
                    <option value="가방 소품">가방 소품</option>
                    <option value="지갑/머니클립">지갑/머니클립</option>
                    <option value="클러치 백">클러치 백</option>
                  </>
                )}
                {product.majorCategory === '패션소품' && (
                  <>
                    <option value="신상">신상</option>
                    <option value="모자">모자</option>
                    <option value="머플러">머플러</option>
                    <option value="주얼리">주얼리</option>
                    <option value="양말/레그웨어">양말/레그웨어</option>
                    <option value="선글라스/안경테">선글라스/안경테</option>
                    <option value="액세서리">액세서리</option>
                    <option value="시계">시계</option>
                    <option value="벨트">벨트</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <Label htmlFor="genderCategory">성별 *</Label>
              <select
                id="genderCategory"
                value={product.genderCategory}
                onChange={(e) => handleInputChange('genderCategory', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">성별을 선택하세요</option>
                <option value="전체">전체</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>
            <div>
              <Label htmlFor="productLink">상품 링크 *</Label>
              <Input
                id="productLink"
                value={product.productLink}
                onChange={(e) => handleInputChange('productLink', e.target.value)}
                placeholder="상품 링크를 입력하세요"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="productContent">상품 설명 *</Label>
            <Textarea
              id="productContent"
              value={product.productContent}
              onChange={(e) => handleInputChange('productContent', e.target.value)}
              placeholder="상품 설명을 입력하세요"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="productImage">상품 이미지 *</Label>
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
                required
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
              {saving ? '추가 중...' : '추가'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
