import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 검색 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요' },
        { status: 400 }
      )
    }

    // 백엔드 API를 통해 상품 검색
    const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'
    
    const backendParams = new URLSearchParams({
      keyword: query.trim(),
      type: 'all'
    })
    
    const response = await fetch(`${API_BASE}/api/admin/products/search?${backendParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`검색 API 오류: ${response.status}`)
    }
    
    const products = await response.json()
    console.log('검색 API 응답:', products)
    console.log('첫 번째 상품 ID 필드들:', products[0] ? {
      id: products[0].id,
      productIdx: products[0].productIdx,
      product_id: products[0].product_id,
      product_idx: products[0].product_idx
    } : '상품 없음')
    
    const searchResults = {
      products: products || [],
      total: products?.length || 0,
      page,
      limit,
      query: query.trim()
    }

    // 검색 로그 저장 (실제 구현 시)
    // await saveSearchLog(query.trim(), request.headers.get('user-agent'))

    return NextResponse.json(searchResults)
  } catch (error) {
    console.error('검색 오류:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 검색 로그 저장 함수 (실제 구현 시 사용)
async function saveSearchLog(query: string, userAgent: string | null) {
  try {
    // 실제 데이터베이스 저장 로직
    // INSERT INTO search_logs (query, user_agent, created_at) 
    // VALUES (?, ?, NOW())
  } catch (error) {
    console.error('검색 로그 저장 실패:', error)
  }
}

