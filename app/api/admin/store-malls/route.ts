import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 백엔드 API 호출 시도
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/admin/store-malls`, {
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
    const mockStoreMalls = [
      {
        id: 1,
        storeIdx: 1,
        storeName: "샘플 제휴몰 1",
        contact: "contact@store1.com",
        storeLink: "https://store1.com",
        royaltyRate: 5.0,
        storeLogo: "/placeholder.svg",
        isActive: true,
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15"
      },
      {
        id: 2,
        storeIdx: 2,
        storeName: "샘플 제휴몰 2",
        contact: "contact@store2.com",
        storeLink: "https://store2.com",
        royaltyRate: 7.5,
        storeLogo: "/placeholder.svg",
        isActive: true,
        createdAt: "2024-01-16",
        updatedAt: "2024-01-16"
      }
    ]

    return NextResponse.json(mockStoreMalls)
  } catch (error) {
    console.error('어드민 제휴몰 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '제휴몰 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
