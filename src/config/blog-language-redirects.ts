import type { Redirect } from 'next/dist/lib/load-custom-routes';

/**
 * 301 from one language's slug to the other's, for blog articles.
 *
 * `blog.slug` (English) and `blog.slug_es` point to the same article, so one piece is
 * reachable through two URLs in each language. Only one should exist per language:
 *   /es/blog/why-your-business-is-still-losing-customers-in-2026
 *     -> /es/blog/negocio-sigue-perdiendo-clientes-2026
 *
 * This can NOT be done inside the page: the route is prerendered with ISR and a redirect
 * thrown during a cached render is ignored (it responds 200). Here it's emitted as a
 * routing rule, which Next applies before rendering.
 *
 * The map is built at build time by reading the DB. An article published after the last
 * deploy won't have a rule, but doesn't need one: it's born with its slug in each
 * language and its URL in the other language was never indexed.
 */
export async function blogSlugLanguageRedirects(): Promise<Redirect[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];

  try {
    const res = await fetch(
      `${url}/rest/v1/blog?select=slug,slug_es&published=eq.true`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];

    const posts: Array<{ slug: string | null; slug_es: string | null }> = await res.json();

    return posts.flatMap((p) => {
      // Without both slugs there's nothing to consolidate.
      if (!p.slug || !p.slug_es || p.slug === p.slug_es) return [];
      return [
        // The English slug requested under Spanish -> its Spanish slug.
        {
          source: `/es/blog/${p.slug}`,
          destination: `/es/blog/${p.slug_es}`,
          statusCode: 301 as const,
        },
        // And the other way around, so the Spanish version isn't reachable under /en.
        {
          source: `/en/blog/${p.slug_es}`,
          destination: `/en/blog/${p.slug}`,
          statusCode: 301 as const,
        },
      ];
    });
  } catch {
    // Without a DB at build time no rules are emitted: the page still resolves both slugs.
    return [];
  }
}
