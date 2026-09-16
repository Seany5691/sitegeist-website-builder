/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Disable font optimization to prevent build failures when Google Fonts are unreachable
  optimizeFonts: false,
}

module.exports = nextConfig
