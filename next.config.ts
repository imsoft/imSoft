import type { NextConfig } from "next";
import { BLOG_SLUG_REDIRECTS } from "./src/config/blog-redirects";
import { legacyRedirects } from "./src/config/legacy-redirects";
import { blogSlugLanguageRedirects } from "./src/config/blog-language-redirects";

const nextConfig: NextConfig = {
  reactCompiler: true,
  compress: true,
  async redirects() {
    return [
      // URLs del sitio anterior que Search Console reporta en 404.
      ...legacyRedirects(),
      // Slug del otro idioma -> slug del idioma pedido.
      ...(await blogSlugLanguageRedirects()),
      { source: '/:lang(es|en)/servicios', destination: '/:lang/services', permanent: true },
      { source: '/:lang(es|en)/servicios/:slug', destination: '/:lang/services/:slug', permanent: true },
      // /quote nunca existio: este redirect terminaba en 404. El cotizador es el
      // formulario de contacto.
      { source: '/:lang(es|en)/cotizador', destination: '/:lang/contact', permanent: true },
      // Consolidacion del blog: los posts que canibalizaban a otro redirigen al que
      // absorbe el tema, en ambos idiomas. Ver src/config/blog-redirects.ts.
      // 301 explicito en vez de `permanent: true` (que emite 308): es una
      // consolidacion de SEO y el 301 lo entiende cualquier rastreador o auditor.
      ...Object.entries(BLOG_SLUG_REDIRECTS).map(([from, to]) => ({
        source: `/:lang(es|en)/blog/${from}`,
        destination: `/:lang/blog/${to}`,
        statusCode: 301 as const,
      })),
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
