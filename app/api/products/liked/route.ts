import { NextRequest, NextResponse } from 'next/server'

const BE = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8080'

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? ''
    const { productIds } = await req.json()
    
    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ error: '상품 ID 목록이 필요합니다' }, { status: 400 })
    }
    
    // 여러 상품 정보를 한 번에 가져오기
    const productPromises = productIds.map(async (productId: number) => {
      const res = await fetch(`${BE}/api/products/${productId}`, {
        headers: { 
          'Content-Type': 'application/json',
          ...(auth && { 'Authorization': auth }) 
        },
        cache: 'no-store',
      })
      
      if (res.ok) {
        return res.json()
      }
      return null
    })
    
    const products = await Promise.all(productPromises)
    const validProducts = products.filter(product => product !== null)
    
    return NextResponse.json(validProducts)
  } catch (error) {
    console.error('좋아요한 상품 상세 정보 조회 프록시 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
