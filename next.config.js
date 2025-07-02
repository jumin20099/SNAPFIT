/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/oauth2/authorization/:provider',
        destination: 'http://localhost:8080/oauth2/authorization/:provider',
      },
      {
        source: '/login/oauth2/code/:provider',
        destination: 'http://localhost:8080/login/oauth2/code/:provider',
      },
    ];
  },
};

export default nextConfig; 