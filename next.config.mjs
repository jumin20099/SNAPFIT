/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com' },
      // 필요 시 S3/CloudFront 도메인 추가
      // { protocol: 'https', hostname: 'your-s3-bucket.s3.ap-northeast-2.amazonaws.com' },
      // { protocol: 'https', hostname: 'cdn.snapfit.app' },
    ],
  },
  async rewrites() {
    return [
      // 백엔드로 프록시할 특정 API 경로들만 지정
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8080/api/auth/:path*'
      },
      {
        source: '/api/partner/application',
        destination: 'http://localhost:8080/api/partner/application'
      },
      {
        source: '/api/partner/application/:path*',
        destination: 'http://localhost:8080/api/partner/application/:path*'
      },
      {
        source: '/api/partner/products',
        destination: 'http://localhost:8080/api/partner/products'
      },
      {
        source: '/api/partner/products/:path*',
        destination: 'http://localhost:8080/api/partner/products/:path*'
      },
      {
        source: '/api/partner/dashboard',
        destination: 'http://localhost:8080/api/partner/dashboard'
      },
      {
        source: '/api/partner/admin/:path*',
        destination: 'http://localhost:8080/api/partner/admin/:path*'
      },
      {
        source: '/api/admin/stores/:path*',
        destination: 'http://localhost:8080/api/admin/stores/:path*'
      },
      {
        source: '/api/admin/products/:path*',
        destination: 'http://localhost:8080/api/admin/products/:path*'
      },
      {
        source: '/api/media/:path*',
        destination: 'http://localhost:8080/api/media/:path*'
      },
      {
        source: '/api/user/:path*',
        destination: 'http://localhost:8080/api/user/:path*'
      },
      // OAuth2 (Kakao 등) 리다이렉트 프록시
      {
        source: '/oauth2/:path*',
        destination: 'http://localhost:8080/oauth2/:path*'
      }
    ]
  }
}
 
export default nextConfig 