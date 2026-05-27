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
      // Supabase Storage (cualquier proyecto)
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      // Imágenes de stock / CDNs habituales
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.unsplash.com' },
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      // Avatares de terceros
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // CDN de imágenes adicionales
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Placeholders usados en la UI
      { protocol: 'https', hostname: 'tailark.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },
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
