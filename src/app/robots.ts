import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

  // Las rutas reales llevan prefijo de idioma (/es/dashboard, /en/login...), asi que
  // un Disallow de '/dashboard/' a secas no bloquea nada. Cubrimos ambas formas.
  // /_next/ NO se bloquea: ahi viven el CSS, el JS y las imagenes que Google necesita para
  // renderizar la pagina como la ve una persona. Bloquearlo va contra su guia.
  const disallow = [
    '/api/',
    '/auth/',
    ...['dashboard', 'login', 'signup', 'forgot-password', 'reset-password', 'unsubscribe'].flatMap(
      (path) => [`/es/${path}/`, `/en/${path}/`, `/es/${path}`, `/en/${path}`],
    ),
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
