import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

// 최근 본 상품 API
export async function GET(request: NextRequest) {
  try {
    // 실제로는 사용자 인증 후 해당 사용자의 최근 본 상품을 조회해야 함
    // 현재는 빈 배열 반환 (실제 구현 시 교체 필요)
    
    const recentProducts: Array<{
      id: string
      name: string
      brand: string
      price: number
      originalPrice?: number
      discountRate?: number
      imageUrl: string
      shippingInfo?: string
      rating?: number
      reviewCount?: number
      badge?: string
      isLiked?: boolean
    }> = [
      // 실제 데이터베이스 쿼리 예시:
      // SELECT p.*, rv.viewed_at, l.is_liked
      // FROM products p
      // JOIN recent_views rv ON p.id = rv.product_id
      // LEFT JOIN likes l ON p.id = l.product_id AND l.user_id = ?
      // WHERE rv.user_id = ? AND rv.deleted_at IS NULL
      // ORDER BY rv.viewed_at DESC
      // LIMIT 20
    ]

    return NextResponse.json({ products: recentProducts })
  } catch (error) {
    console.error('최근 본 상품 조회 오류:', error)
    return NextResponse.json(
      { error: '최근 본 상품을 불러올 수 없습니다' },
      { status: 500 }
    )
  }
}

// 상품 조회 기록 저장
export async function POST(request: NextRequest) {
  try {
    // CSRF 토큰 검증
    const isValidCsrf = await validateCsrfToken(request)
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF 토큰이 유효하지 않습니다' },
        { status: 403 }
      )
    }

    
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 실제로는 사용자 인증 후 상품 조회 기록을 저장해야 함
    // 현재는 성공 응답만 반환 (실제 구현 시 교체 필요)
    
    // 실제 데이터베이스 쿼리 예시:
    // INSERT INTO recent_views (user_id, product_id, viewed_at)
    // VALUES (?, ?, NOW())
    // ON DUPLICATE KEY UPDATE viewed_at = NOW()

    return NextResponse.json({ 
      success: true, 
      message: '조회 기록이 저장되었습니다' 
    })
  } catch (error) {
    console.error('조회 기록 저장 오류:', error)
    return NextResponse.json(
      { error: '조회 기록 저장에 실패했습니다' },
      { status: 500 }
    )
  }
}

