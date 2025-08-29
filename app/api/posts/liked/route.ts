import { NextRequest, NextResponse } from 'next/server'

const BE = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8080'

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? ''
    const { postIds } = await req.json()
    
    if (!postIds || !Array.isArray(postIds)) {
      return NextResponse.json({ error: '게시글 ID 목록이 필요합니다' }, { status: 400 })
    }
    
    // 여러 게시글 정보를 한 번에 가져오기
    const postPromises = postIds.map(async (postId: number) => {
      const res = await fetch(`${BE}/api/posts/${postId}`, {
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
    
    const posts = await Promise.all(postPromises)
    const validPosts = posts.filter(post => post !== null)
    
    return NextResponse.json(validPosts)
  } catch (error) {
    console.error('좋아요한 게시글 상세 정보 조회 프록시 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
