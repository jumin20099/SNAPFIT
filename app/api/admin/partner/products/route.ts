import { NextRequest, NextResponse } from 'next/server'
import { fetchBackendWithAuth } from '@/api/_utils/backend-fetch'

export async function GET(request: NextRequest) {
  try {
    const { response, refreshedCookie } = await fetchBackendWithAuth(request, {
      path: '/api/admin/partner/products',
      init: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    })

    if (response.status === 401) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    if (!response.ok) {
      console.warn('백엔드 API 호출 실패, mock 데이터 사용:', response.status)
      const mockPartnerProducts = [
        {
          id: 3,
          product_name: '제휴사 상품 1',
          product_content: '제휴사에서 등록한 상품입니다.',
          product_image: '/placeholder.svg',
          product_link: 'https://partner1.com/product1',
          product_category: '액세서리',
          store_mall: '3',
          price: '₩15,900',
          created_at: '2024-01-17',
          status: 'active',
          type: '제휴사',
          isActive: true,
          isPartner: true,
          majorCategory: '액세서리',
          subCategory: '가방',
          genderCategory: '전체',
        },
        {
          id: 4,
          product_name: '제휴사 상품 2',
          product_content: '제휴사에서 등록한 상품입니다.',
          product_image: '/placeholder.svg',
          product_link: 'https://partner2.com/product2',
          product_category: '화장품',
          store_mall: '4',
          price: '₩45,900',
          created_at: '2024-01-18',
          status: 'pending',
          type: '제휴사',
          isActive: false,
          isPartner: true,
          majorCategory: '화장품',
          subCategory: '스킨케어',
          genderCategory: '여성',
        },
      ]
      return NextResponse.json(mockPartnerProducts)
    }

    const data = await response.json()
    const nextResponse = NextResponse.json(data)
    if (refreshedCookie) {
      nextResponse.headers.append('set-cookie', refreshedCookie)
    }
    return nextResponse
  } catch (error) {
    console.error('어드민 제휴사 상품 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '제휴사 상품 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
