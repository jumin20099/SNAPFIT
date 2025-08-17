import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 백엔드 API 호출 시도
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (backendError) {
      console.warn('백엔드 API 호출 실패, mock 데이터 사용:', backendError)
    }

    // 백엔드 API가 없을 때 mock 데이터 반환
    const mockProducts = [
      {
        id: 1,
        product_name: "샘플 상품 1",
        product_content: "샘플 상품 설명입니다.",
        product_image: "/placeholder.svg",
        product_link: "https://example.com/product1",
        product_category: "의류",
        store_mall: "1",
        price: "₩29,900",
        created_at: "2024-01-15",
        status: "active",
        type: "일반",
        isActive: true,
        isPartner: false,
        majorCategory: "상의",
        subCategory: "티셔츠",
        genderCategory: "남성"
      },
      {
        id: 2,
        product_name: "샘플 상품 2",
        product_content: "샘플 상품 설명입니다.",
        product_image: "/placeholder.svg",
        product_link: "https://example.com/product2",
        product_category: "신발",
        store_mall: "2",
        price: "₩89,900",
        created_at: "2024-01-16",
        status: "active",
        type: "일반",
        isActive: true,
        isPartner: false,
        majorCategory: "신발",
        subCategory: "스니커즈",
        genderCategory: "여성"
      }
    ]

    return NextResponse.json(mockProducts)
  } catch (error) {
    console.error('어드민 상품 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '상품 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
