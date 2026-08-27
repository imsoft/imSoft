import type { Redirect } from 'next/dist/lib/load-custom-routes';

/**
 * Redirecciones de las URLs del sitio anterior.
 *
 * Search Console reportaba 31 URLs en 404 (25 rutas distintas), todas heredadas de la
 * version previa de imsoft.io: slugs de servicio en ingles que nunca existieron en la
 * tabla `services`, rutas sin prefijo de idioma (`/servicios/...`, `/portafolio/`),
 * dos idiomas retirados (`/ru/`, `/zh/`) y articulos de blog que ya no existen.
 *
 * Solo se redirige a una pagina realmente equivalente. Cuando no la hay, el destino es
 * la seccion padre: enviar una URL muerta a algo que no le corresponde hace que Google
 * lo trate como soft 404 y no aporta nada al usuario.
 *
 * `imsoft.io` sin www ya redirige a `www.imsoft.io` en Vercel, asi que basta con cubrir
 * la ruta. Next normaliza la barra final en un salto propio, asi que `/portafolio/` pasa
 * por `/portafolio` antes de llegar al destino: son dos saltos, dentro de lo que Google
 * sigue sin problema.
 *
 * Se usa `statusCode: 301` en vez de `permanent: true` (que emite 308), igual que en
 * blog-redirects.ts: cualquier rastreador o auditor entiende el 301.
 */

/** Slugs de servicio en ingles del sitio viejo -> slug real en la tabla `services`. */
const LEGACY_SERVICE_SLUGS: Record<string, string> = {
  'technology-consulting': 'consultoria-tecnologica',
  'mobile-applications': 'aplicaciones-moviles',
  'online-store': 'tiendas-en-linea',
  'ai-ml-consulting': 'inteligencia-artificial',
  'website-development': 'web-pages',
};

/** Rutas `/servicios/<slug>` del sitio viejo -> slug real. */
const LEGACY_SERVICIOS_SLUGS: Record<string, string> = {
  'analisis-de-datos': 'data-analysis',
  'consultoria-en-ia-y-ml': 'inteligencia-artificial',
  'sitios-web': 'web-pages',
  'tienda-en-linea': 'tiendas-en-linea',
  'consultoria-tecnologica': 'consultoria-tecnologica',
  'aplicaciones-moviles': 'aplicaciones-moviles',
};

/**
 * Articulos del blog viejo que si tienen un equivalente vivo.
 * Los que no lo tienen van al indice del blog mas abajo.
 */
const LEGACY_BLOG_POSTS: Record<string, string> = {
  'cuanto-cuesta-desarrollar-una-app-movil-en-mexico-precios-tiempos-y-factores-clave':
    '/es/blog/how-to-build-a-native-mobile-app-without-exceeding-your-budget',
  'las-mejores-ideas-para-digitalizar-tu-negocio-este-ano-y-como-empezar':
    '/es/blog/how-to-digitalize-your-sme-without-losing-control-of-your-business',
  'vale-la-pena-invertir-en-google-ads-pros-contras-y-cuanto-deberias-invertir':
    '/es/blog/5-digital-marketing-strategies-that-drive-results-in-2026',
};

export function legacyRedirects(): Redirect[] {
  return [
    // --- Servicios con el slug en ingles, en ambos idiomas ---
    ...Object.entries(LEGACY_SERVICE_SLUGS).map(([from, to]) => ({
      source: `/:lang(es|en)/services/${from}`,
      destination: `/:lang/services/${to}`,
      statusCode: 301 as const,
    })),

    // --- `/servicios/<slug>` sin prefijo de idioma (el sitio viejo no lo tenia) ---
    ...Object.entries(LEGACY_SERVICIOS_SLUGS).map(([from, to]) => ({
      source: `/servicios/${from}`,
      destination: `/es/services/${to}`,
      statusCode: 301 as const,
    })),
    // Cualquier otro /servicios/<slug> que no este mapeado: al listado, no a un 404.
    { source: '/servicios/:slug', destination: '/es/services', statusCode: 301 as const },
    { source: '/servicios', destination: '/es/services', statusCode: 301 as const },

    // El slug de la landing de Zapopan cambio de `desarrollo-web` a `paginas-web`:
    // el autocompletado de Google no devuelve nada para "desarrollo web zapopan" y si
    // para "paginas web zapopan". Estuvo un dia en linea, asi que se redirige.
    {
      source: '/:lang(es|en)/zapopan/desarrollo-web',
      destination: '/es/zapopan/paginas-web',
      statusCode: 301 as const,
    },

    // --- Rutas sueltas del sitio viejo ---
    { source: '/portafolio', destination: '/es/portfolio', statusCode: 301 as const },
    { source: '/historia', destination: '/es/about', statusCode: 301 as const },
    { source: '/aviso-de-privacidad', destination: '/es/privacy-policy', statusCode: 301 as const },
    { source: '/:lang(es|en)/aviso-de-privacidad', destination: '/:lang/privacy-policy', statusCode: 301 as const },
    { source: '/:lang(es|en)/privacy-notice', destination: '/:lang/privacy-policy', statusCode: 301 as const },
    { source: '/privacy-notice', destination: '/en/privacy-policy', statusCode: 301 as const },

    // --- Idiomas retirados: nunca hubo contenido real en ruso ni en chino ---
    { source: '/ru', destination: '/es', statusCode: 301 as const },
    { source: '/ru/:path*', destination: '/es', statusCode: 301 as const },
    { source: '/zh', destination: '/es', statusCode: 301 as const },
    { source: '/zh/:path*', destination: '/es', statusCode: 301 as const },

    // --- Blog viejo con equivalente vivo ---
    ...Object.entries(LEGACY_BLOG_POSTS).map(([from, to]) => ({
      source: `/blog/${from}`,
      destination: to,
      statusCode: 301 as const,
    })),
    // Resto del blog viejo (sin prefijo de idioma): al indice, que es su seccion padre.
    { source: '/blog/:slug', destination: '/es/blog', statusCode: 301 as const },
    { source: '/blog', destination: '/es/blog', statusCode: 301 as const },

    // Articulos en ingles que ya no existen y no tienen equivalente.
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
