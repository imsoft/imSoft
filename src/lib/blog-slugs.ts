import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Resolucion de slugs del blog por idioma.
 *
 * `blog.slug` se genera desde `title_en`, asi que las URLs en espanol quedaban en ingles
 * (/es/blog/why-your-business-is-still-losing-customers-in-2026 con contenido en espanol).
 * `blog.slug_es` anade el slug en espanol; /es usa ese y /en sigue usando `slug`.
 *
 * Un post se puede pedir por cualquiera de sus dos slugs: si el que llega no es el del
 * idioma de la URL, la pagina hace un 301 al correcto. Asi las URLs ya indexadas siguen
 * funcionando y consolidan hacia la nueva.
 */

export interface BlogSlugRow {
  slug?: string | null;
  slug_es?: string | null;
}

/** El slug que le corresponde a este post en el idioma dado. */
export function canonicalBlogSlug(post: BlogSlugRow, lang: string): string {
  if (lang === 'es') return post.slug_es || post.slug || '';
  return post.slug || post.slug_es || '';
}

/**
 * Busca un post por cualquiera de sus dos slugs.
 *
 * La migracion que crea `slug_es` la aplica el equipo a mano en Supabase, asi que el
 * codigo puede desplegarse antes que ella: si la columna todavia no existe, PostgREST
 * responde 42703 y caemos a la consulta de siempre por `slug` en vez de romper el blog.
 */
// El resto de la pagina lee campos del post sin un tipo generado (title_es, content_en,
// author_name...), asi que se devuelve la fila tal cual la da PostgREST.
export async function findBlogPostBySlug(
  supabase: SupabaseClient,
  slug: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const { data, error } = await supabase
    .from('blog')
    .select('*')
    .or(`slug.eq.${slug},slug_es.eq.${slug}`)
    .eq('published', true)
    .maybeSingle();

  if (!error) return data;

  const missingColumn =
    error.code === '42703' || /slug_es/.test(error.message ?? '');
  if (!missingColumn) return null;

  const { data: legacy } = await supabase
    .from('blog')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  return legacy;
}
