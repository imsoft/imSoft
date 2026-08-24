import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

  // Las rutas reales llevan prefijo de idioma (/es/dashboard, /en/login...), asi que
  // un Disallow de '/dashboard/' a secas no bloquea nada. Cubrimos ambas formas.
  const disallow = [
    '/api/',
    '/_next/',
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
