/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/imsoft/BlogPosts/main/images/**',
      },
    ],
  },
}

module.exports = nextConfig;
