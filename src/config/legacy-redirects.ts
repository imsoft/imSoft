import type { Redirect } from 'next/dist/lib/load-custom-routes';

/**
 * Redirects for URLs from the previous site.
 *
 * Search Console reported 31 URLs returning 404 (25 distinct paths), all inherited from the
 * previous version of imsoft.io: English service slugs that never existed in the
 * `services` table, paths without a language prefix (`/servicios/...`, `/portafolio/`),
 * two retired languages (`/ru/`, `/zh/`) and blog articles that no longer exist.
 *
 * We only redirect to a truly equivalent page. When there is none, the target is the
 * parent section: sending a dead URL to something unrelated makes Google treat it as a
 * soft 404 and gives the user nothing.
 *
 * `imsoft.io` without www already redirects to `www.imsoft.io` on Vercel, so covering the
 * path is enough. Next normalizes the trailing slash in its own hop, so `/portafolio/` goes
 * through `/portafolio` before reaching the target: two hops, which Google follows fine.
 *
 * We use `statusCode: 301` instead of `permanent: true` (which emits 308), same as in
 * blog-redirects.ts: every crawler or auditor understands 301.
 */

/** English service slugs from the old site -> actual slug in the `services` table. */
const LEGACY_SERVICE_SLUGS: Record<string, string> = {
  'technology-consulting': 'consultoria-tecnologica',
  'mobile-applications': 'aplicaciones-moviles',
  'online-store': 'tiendas-en-linea',
  'ai-ml-consulting': 'inteligencia-artificial',
  'website-development': 'web-pages',
};

/** Old-site `/servicios/<slug>` paths -> actual slug. */
const LEGACY_SPANISH_SERVICE_PATHS: Record<string, string> = {
  'analisis-de-datos': 'data-analysis',
  'consultoria-en-ia-y-ml': 'inteligencia-artificial',
  'sitios-web': 'web-pages',
  'tienda-en-linea': 'tiendas-en-linea',
  'consultoria-tecnologica': 'consultoria-tecnologica',
  'aplicaciones-moviles': 'aplicaciones-moviles',
};

/**
 * Old blog articles that do have a live equivalent.
 * Those without one go to the blog index further down.
 */
const LEGACY_BLOG_POSTS: Record<string, string> = {
  // The most-searched URL of the old site ("cuanto cuesta una app", pos. 24 in 2025).
  // It pointed to a post that didn't answer the question; now there is one that does.
  'cuanto-cuesta-desarrollar-una-app-movil-en-mexico-precios-tiempos-y-factores-clave':
    '/es/blog/cuanto-cuesta-desarrollar-una-app-en-mexico',
  'las-mejores-ideas-para-digitalizar-tu-negocio-este-ano-y-como-empezar':
    '/es/blog/como-digitalizar-pyme-sin-perder-control-negocio',
  'vale-la-pena-invertir-en-google-ads-pros-contras-y-cuanto-deberias-invertir':
    '/es/blog/5-estrategias-marketing-digital-generan-resultados-2026',
};

export function legacyRedirects(): Redirect[] {
  return [
    // --- Services with the English slug, in both languages ---
    ...Object.entries(LEGACY_SERVICE_SLUGS).map(([from, to]) => ({
      source: `/:lang(es|en)/services/${from}`,
      destination: `/:lang/services/${to}`,
      statusCode: 301 as const,
    })),

    // --- `/servicios/<slug>` without a language prefix (the old site had none) ---
    ...Object.entries(LEGACY_SPANISH_SERVICE_PATHS).map(([from, to]) => ({
      source: `/servicios/${from}`,
      destination: `/es/services/${to}`,
      statusCode: 301 as const,
    })),
    // Any other unmapped /servicios/<slug>: to the listing, not a 404.
    { source: '/servicios/:slug', destination: '/es/services', statusCode: 301 as const },
    { source: '/servicios', destination: '/es/services', statusCode: 301 as const },

    // The Zapopan landing slug changed from `desarrollo-web` to `paginas-web`: Google
    // autocomplete returns nothing for "desarrollo web zapopan" but does for
    // "paginas web zapopan". It was live for a day, so it gets redirected.
    {
      source: '/:lang(es|en)/zapopan/desarrollo-web',
      destination: '/es/zapopan/paginas-web',
      statusCode: 301 as const,
    },

    // --- Monterrey and CDMX industry landings (Jan 2026 → Sep 2026) ---
    // They were the Guadalajara template with another city: 0 clicks in 90 days. They go
    // to their city's software development landing, which now has its own copy.
    ...(['monterrey', 'cdmx'] as const).flatMap((city) => [
      { source: `/:lang(es|en)/${city}/software-para-:industry`, destination: `/es/${city}/empresas-de-software`, statusCode: 301 as const },
    ]),

    // --- Miscellaneous old-site paths ---
    { source: '/portafolio', destination: '/es/portfolio', statusCode: 301 as const },
    { source: '/historia', destination: '/es/about', statusCode: 301 as const },
    { source: '/aviso-de-privacidad', destination: '/es/privacy-policy', statusCode: 301 as const },
    { source: '/:lang(es|en)/aviso-de-privacidad', destination: '/:lang/privacy-policy', statusCode: 301 as const },
    { source: '/:lang(es|en)/privacy-notice', destination: '/:lang/privacy-policy', statusCode: 301 as const },
    { source: '/privacy-notice', destination: '/en/privacy-policy', statusCode: 301 as const },

    // --- Retired languages: there was never real Russian or Chinese content ---
    { source: '/ru', destination: '/es', statusCode: 301 as const },
    { source: '/ru/:path*', destination: '/es', statusCode: 301 as const },
    { source: '/zh', destination: '/es', statusCode: 301 as const },
    { source: '/zh/:path*', destination: '/es', statusCode: 301 as const },

    // --- Old blog posts with a live equivalent ---
    ...Object.entries(LEGACY_BLOG_POSTS).map(([from, to]) => ({
      source: `/blog/${from}`,
      destination: to,
      statusCode: 301 as const,
    })),
    // Rest of the old blog (no language prefix): to the index, its parent section.
    { source: '/blog/:slug', destination: '/es/blog', statusCode: 301 as const },
    { source: '/blog', destination: '/es/blog', statusCode: 301 as const },

    // English articles that no longer exist and have no equivalent.
    {
      source: '/en/blog/our-step-by-step-process-to-create-a-successful-website-at-imsoft',
      destination: '/en/about',
      statusCode: 301 as const,
    },
    {
      source: '/en/blog/free-tools-every-digital-entrepreneur-should-know-in-2025',
      destination: '/en/blog',
      statusCode: 301 as const,
    },
  ];
}
