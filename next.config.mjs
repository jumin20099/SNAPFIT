import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.ap-northeast-2.amazonaws.com' },
      { protocol: 'https', hostname: 'cdn.snapfit.app' },
      // 필요 시 S3/CloudFront 도메인 추가
      // { protocol: 'https', hostname: 'your-s3-bucket.s3.ap-northeast-2.amazonaws.com' },
      // { protocol: 'https', hostname: 'cdn.snapfit.app' },
    ],
  },
  // 번들 분석기 활성화
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
  // 실험적 기능
  experimental: {
    // optimizePackageImports: ['@tanstack/react-query', 'lucide-react'], // 임시 비활성화
  },
  async rewrites() {
    // 프로덕션에서는 환경변수 사용, 개발에서는 localhost 사용
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    
    return [
      // 로컬 업로드 파일 서빙
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`
      },
      // 백엔드로 프록시할 특정 API 경로들만 지정
      // WebSocket(SockJS) 엔드포인트 프록시
      {
        source: '/ws/:path*',
        destination: `${backendUrl}/ws/:path*`
      },
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/auth/:path*`
      },
      {
        source: '/api/partner/application',
        destination: `${backendUrl}/api/partner/application`
      },
      {
        source: '/api/partner/application/:path*',
        destination: `${backendUrl}/api/partner/application/:path*`
      },
      {
        source: '/api/partner/products',
        destination: `${backendUrl}/api/partner/products`
      },
      {
        source: '/api/partner/products/:path*',
        destination: `${backendUrl}/api/partner/products/:path*`
      },
      {
        source: '/api/partner/dashboard',
        destination: `${backendUrl}/api/partner/dashboard`
      },
      {
        source: '/api/partner/admin/:path*',
        destination: `${backendUrl}/api/partner/admin/:path*`
      },
      {
        source: '/api/admin/stores/:path*',
        destination: `${backendUrl}/api/admin/stores/:path*`
      },
      {
        source: '/api/admin/products/:path*',
        destination: `${backendUrl}/api/admin/products/:path*`
      },
      {
        source: '/api/media/:path*',
        destination: `${backendUrl}/api/media/:path*`
      },
      {
        source: '/api/user/:path*',
        destination: `${backendUrl}/api/user/:path*`
      },
      // OAuth2 (Kakao 등) 리다이렉트 프록시
      {
        source: '/oauth2/:path*',
        destination: `${backendUrl}/oauth2/:path*`
      },
      {
        source: '/api/auth/logout',
        destination: `${backendUrl}/api/auth/logout`
      },
      // 좋아요/스크랩 API 프록시 (백업용)
      {
        source: '/api/likes/:path*',
        destination: `${backendUrl}/api/likes/:path*`
      },
      {
        source: '/api/scraps/:path*',
        destination: `${backendUrl}/api/scraps/:path*`
      }
    ]
  }
}
 
export default bundleAnalyzer(nextConfig) 