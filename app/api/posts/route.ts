import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf-utils'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const size = searchParams.get('size') || '20'
    const page = searchParams.get('page') || '0'
    const sort = searchParams.get('sort') || 'createdAt'
    const includePostId = searchParams.get('includePostId')
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    
    // 백엔드 API 호출
    let backendUrl = `${BACKEND_URL}/api/posts?size=${size}&page=${page}&sort=${sort}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[api/posts] forward request', {
        backendUrl,
        page,
        size,
        sort,
        hasAuth: Boolean(authHeader),
        hasCookie: Boolean(cookieHeader)
      })
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    if (process.env.NODE_ENV === 'development') {
      const sample = Array.isArray(data?.content)
        ? data.content.slice(0, 3).map((post: any) => ({
            postId: post?.postId,
            isLiked: post?.isLiked,
            likeCount: post?.likeCount
          }))
        : []
      console.log('[api/posts] backend response sample', {
        totalElements: data?.totalElements,
        sample
      })
    }
    
    // 특정 게시글을 우선적으로 포함하는 경우 (첫 페이지에서만)
    if (includePostId && page === '0' && data.content) {
      const targetPostId = parseInt(includePostId)
      const posts = data.content
      const targetPostIndex = posts.findIndex((post: any) => post.postId === targetPostId)

      if (targetPostIndex !== -1) {
        const targetPost = posts.splice(targetPostIndex, 1)[0]
        posts.unshift(targetPost)
        console.log(`게시글 ${targetPostId}를 최상단으로 이동했습니다.`)
      } else {
        console.log(`게시글 ${targetPostId}를 목록에서 찾을 수 없습니다. 개별 조회를 시도합니다.`)

        try {
          const detailResponse = await fetch(`${BACKEND_URL}/api/posts/${targetPostId}`, {
            method: 'GET',
            headers,
            credentials: 'include',
          })

          if (detailResponse.ok) {
            const detailData = await detailResponse.json()
            if (detailData) {
              posts.unshift(detailData)
              const maxSize = parseInt(size, 10)
              if (Number.isFinite(maxSize) && posts.length > maxSize) {
                posts.length = maxSize
              }
              console.log(`게시글 ${targetPostId}를 개별 조회하여 목록에 추가했습니다.`)
            }
          } else {
            console.warn(`게시글 ${targetPostId} 개별 조회 실패: ${detailResponse.status}`)
          }
        } catch (detailError) {
          console.error(`게시글 ${targetPostId} 개별 조회 중 오류 발생`, detailError)
        }
      }
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Posts API error:', error)
    return NextResponse.json(
      { error: '게시글을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

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
    const authHeader = request.headers.get('authorization') // Authorization 헤더 추출
    
    // 백엔드 API 호출
    const backendUrl = `${BACKEND_URL}/api/posts`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authHeader) { // Authorization 헤더가 있으면 추가
      headers['Authorization'] = authHeader
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('Create post API error:', error)
    return NextResponse.json(
      { error: '게시글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
