import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 백엔드 API 호출 시도
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/partner/products`, {
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
    const mockPartnerProducts = [
      {
        id: 3,
        product_name: "제휴사 상품 1",
        product_content: "제휴사에서 등록한 상품입니다.",
        product_image: "/placeholder.svg",
        product_link: "https://partner1.com/product1",
        product_category: "액세서리",
        store_mall: "3",
        price: "₩15,900",
        created_at: "2024-01-17",
        status: "active",
        type: "제휴사",
        isActive: true,
        isPartner: true,
        majorCategory: "액세서리",
        subCategory: "가방",
        genderCategory: "전체"
      },
      {
        id: 4,
        product_name: "제휴사 상품 2",
        product_content: "제휴사에서 등록한 상품입니다.",
        product_image: "/placeholder.svg",
        product_link: "https://partner2.com/product2",
        product_category: "화장품",
        store_mall: "4",
        price: "₩45,900",
        created_at: "2024-01-18",
        status: "pending",
        type: "제휴사",
        isActive: false,
        isPartner: true,
        majorCategory: "화장품",
        subCategory: "스킨케어",
        genderCategory: "여성"
      }
    ]

    return NextResponse.json(mockPartnerProducts)
  } catch (error) {
    console.error('어드민 제휴사 상품 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '제휴사 상품 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
