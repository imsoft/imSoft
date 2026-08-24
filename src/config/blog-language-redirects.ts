import type { Redirect } from 'next/dist/lib/load-custom-routes';

/**
 * 301 del slug de un idioma al del otro, para los articulos del blog.
 *
 * `blog.slug` (ingles) y `blog.slug_es` apuntan al mismo articulo, asi que una misma
 * pieza es alcanzable por dos URLs en cada idioma. Solo una debe existir por idioma:
 *   /es/blog/why-your-business-is-still-losing-customers-in-2026
 *     -> /es/blog/negocio-sigue-perdiendo-clientes-2026
 *
 * Esto NO puede hacerse dentro de la pagina: la ruta se prerenderiza por ISR y una
 * redireccion lanzada durante un render cacheado se ignora (responde 200). Aqui se
 * emite como regla de routing, que Next aplica antes de renderizar.
 *
 * El mapa se construye en build leyendo la BD. Un articulo publicado despues del ultimo
 * despliegue no tendra regla, pero tampoco la necesita: nace con su slug de cada idioma
 * y su URL en el otro idioma nunca llego a indexarse.
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
      // Sin los dos slugs no hay nada que consolidar.
      if (!p.slug || !p.slug_es || p.slug === p.slug_es) return [];
      return [
        // El slug ingles pedido en espanol -> su slug espanol.
        {
          source: `/es/blog/${p.slug}`,
          destination: `/es/blog/${p.slug_es}`,
          statusCode: 301 as const,
        },
        // Y al reves, para no dejar la version espanola accesible bajo /en.
        {
          source: `/en/blog/${p.slug_es}`,
          destination: `/en/blog/${p.slug}`,
          statusCode: 301 as const,
        },
      ];
    });
  } catch {
    // Sin BD en build no se emiten reglas: la pagina sigue resolviendo los dos slugs.
    return [];
  }
}
