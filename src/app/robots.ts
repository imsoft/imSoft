import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

  // Real routes carry a language prefix (/es/dashboard, /en/login...), so
  // a bare Disallow of '/dashboard/' blocks nothing. We cover both forms.
  // /_next/ is NOT blocked: it holds the CSS, JS and images Google needs to
  // render the page as a person sees it. Blocking it goes against its guidelines.
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
