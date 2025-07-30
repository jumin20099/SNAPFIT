import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')
    const searchType = searchParams.get('type') || 'all' // all, name, content, major-category, sub-category, store-name

    if (!keyword) {
      return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 })
    }

    // 백엔드 API URL 구성
    let backendUrl = 'http://localhost:8080/api/admin/products/search'
    
    // 검색 타입에 따라 다른 엔드포인트 사용
    switch (searchType) {
      case 'name':
        backendUrl = 'http://localhost:8080/api/admin/products/search/name'
        break
      case 'content':
        backendUrl = 'http://localhost:8080/api/admin/products/search/content'
        break
      case 'major-category':
        backendUrl = 'http://localhost:8080/api/admin/products/search/major-category'
        break
      case 'sub-category':
        backendUrl = 'http://localhost:8080/api/admin/products/search/sub-category'
        break
      case 'store-name':
        backendUrl = 'http://localhost:8080/api/admin/products/search/store-name'
        break
      default:
        // all 타입은 기본 search 엔드포인트 사용
        break
    }

    // 쿼리 파라미터 추가
    const params = new URLSearchParams()
    params.append(searchType === 'all' ? 'keyword' : searchType === 'name' ? 'productName' : 
                 searchType === 'content' ? 'productContent' : 
                 searchType === 'major-category' ? 'majorCategory' :
                 searchType === 'sub-category' ? 'subCategory' : 'storeName', keyword)
    
    backendUrl += `?${params.toString()}`

    console.log('Backend search URL:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Backend search response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend search error response:', errorText)
      throw new Error(`Backend search API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Product search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
} 