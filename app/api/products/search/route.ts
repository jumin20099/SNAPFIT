import { NextRequest, NextResponse } from 'next/server'
const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')
    const searchType = searchParams.get('type') || 'all'
    if (!keyword) return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 })

    let backendUrl = `${API_BASE}/api/admin/products/search`
    switch (searchType) {
      case 'name': backendUrl = `${API_BASE}/api/admin/products/search/name`; break
      case 'content': backendUrl = `${API_BASE}/api/admin/products/search/content`; break
      case 'major-category': backendUrl = `${API_BASE}/api/admin/products/search/major-category`; break
      case 'sub-category': backendUrl = `${API_BASE}/api/admin/products/search/sub-category`; break
      case 'store-name': backendUrl = `${API_BASE}/api/admin/products/search/store-name`; break
    }
    const params = new URLSearchParams()
    params.append(
      searchType === 'all' ? 'keyword'
      : searchType === 'name' ? 'productName'
      : searchType === 'content' ? 'productContent'
      : searchType === 'major-category' ? 'majorCategory'
      : searchType === 'sub-category' ? 'subCategory' : 'storeName',
      keyword
    )
    const auth = request.headers.get('authorization') || ''
    const response = await fetch(`${backendUrl}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) },
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 })
  }
}