import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      { source: '/:lang(es|en)/servicios', destination: '/:lang/services', permanent: true },
      { source: '/:lang(es|en)/servicios/:slug', destination: '/:lang/services/:slug', permanent: true },
      { source: '/:lang(es|en)/cotizador', destination: '/:lang/quote', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'tailark.com',
      },
    ],
  },
};

export default nextConfig;
