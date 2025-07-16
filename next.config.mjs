/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/dashboard',
  assetPrefix: '/dashboard',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
