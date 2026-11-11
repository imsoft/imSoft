import { MetadataRoute } from 'next';

/** Crawlers that get nothing from the site: AI training and third-party SEO sweeps. */
export const BLOCKED_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'meta-externalagent',
  'Amazonbot',
  'cohere-ai',
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'PetalBot',
  'DataForSeoBot',
  'BLEXBot',
];

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
      // Bots that only spend Vercel quota (2026-11-11): AI training crawlers and SEO
      // crawlers that sweep the whole site. AI *search* bots (OAI-SearchBot,
      // ChatGPT-User, PerplexityBot, Claude-SearchBot) stay allowed so imSoft keeps
      // showing up in AI answers. Abusive bots ignore robots.txt: the Vercel firewall
      // covers those.
      {
        userAgent: BLOCKED_BOTS,
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
