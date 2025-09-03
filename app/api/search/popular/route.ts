import { NextRequest, NextResponse } from 'next/server'

// 인기 검색어 API
export async function GET(request: NextRequest) {
  try {
    // 실제로는 데이터베이스나 외부 API에서 인기 검색어를 가져와야 함
    // 현재는 빈 배열 반환 (실제 구현 시 교체 필요)
    
    const popularSearches: Array<{
      id: string
      query: string
      rank: number
      trend: 'up' | 'down' | 'stable'
    }> = [
      // 실제 데이터베이스 쿼리 예시:
      // SELECT query, COUNT(*) as count, 
      //   CASE 
      //     WHEN COUNT(*) > previous_count THEN 'up'
      //     WHEN COUNT(*) < previous_count THEN 'down' 
      //     ELSE 'stable'
      //   END as trend
      // FROM search_logs 
      // WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      // GROUP BY query 
      // ORDER BY count DESC 
      // LIMIT 10
    ]

    return NextResponse.json(popularSearches)
  } catch (error) {
    console.error('인기 검색어 조회 오류:', error)
    return NextResponse.json(
      { error: '인기 검색어를 불러올 수 없습니다' },
      { status: 500 }
    )
  }
}
