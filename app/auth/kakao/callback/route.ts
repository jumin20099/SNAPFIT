import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      // 에러가 있는 경우 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login?error=' + error, request.url))
    }

    if (!code) {
      // 코드가 없는 경우 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }

    // 카카오 액세스 토큰 요청
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID || '',
        client_secret: process.env.KAKAO_CLIENT_SECRET || '',
        code: code,
        redirect_uri: process.env.KAKAO_REDIRECT_URI || 'http://localhost:3000/auth/kakao/callback',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('카카오 토큰 요청 실패:', await tokenResponse.text())
      return NextResponse.redirect(new URL('/login?error=token_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 카카오 사용자 정보 요청
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      console.error('카카오 사용자 정보 요청 실패:', await userResponse.text())
      return NextResponse.redirect(new URL('/login?error=user_info_failed', request.url))
    }

    const userData = await userResponse.json()
    
    // 백엔드 서버로 카카오 로그인 요청
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/auth/kakao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kakaoId: userData.id,
        email: userData.kakao_account?.email,
        nickname: userData.properties?.nickname,
        profileImage: userData.properties?.profile_image,
        accessToken: accessToken,
      }),
    })

    if (!backendResponse.ok) {
      console.error('백엔드 카카오 로그인 실패:', await backendResponse.text())
      return NextResponse.redirect(new URL('/login?error=backend_failed', request.url))
    }

    const backendData = await backendResponse.json()
    
    // JWT 토큰을 쿼리 파라미터로 전달하여 홈페이지로 리다이렉트
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('token', backendData.token)
    redirectUrl.searchParams.set('login', 'success')
    
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('카카오 로그인 콜백 처리 중 오류:', error)
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url))
  }
}
