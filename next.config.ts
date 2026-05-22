import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  compress: true,
  async redirects() {
    return [
      { source: '/:lang(es|en)/servicios', destination: '/:lang/services', permanent: true },
      { source: '/:lang(es|en)/servicios/:slug', destination: '/:lang/services/:slug', permanent: true },
      { source: '/:lang(es|en)/cotizador', destination: '/:lang/quote', permanent: true },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
  },
};

export default nextConfig;
