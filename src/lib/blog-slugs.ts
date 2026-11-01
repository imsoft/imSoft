import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Per-language blog slug resolution.
 *
 * `blog.slug` is generated from `title_en`, so the Spanish URLs ended up in English
 * (/es/blog/why-your-business-is-still-losing-customers-in-2026 with Spanish content).
 * `blog.slug_es` adds the Spanish slug; /es uses it and /en keeps using `slug`.
 *
 * A post can be requested by either of its two slugs: if the incoming one isn't the one
 * for the URL's language, the page does a 301 to the right one. That way already indexed
 * URLs keep working and consolidate towards the new one.
 */

export interface BlogSlugRow {
  slug?: string | null;
  slug_es?: string | null;
}

/** The slug that belongs to this post in the given language. */
export function canonicalBlogSlug(post: BlogSlugRow, lang: string): string {
  if (lang === 'es') return post.slug_es || post.slug || '';
  return post.slug || post.slug_es || '';
}

/**
 * Finds a post by either of its two slugs.
 *
 * The migration that creates `slug_es` is applied by hand in Supabase, so the
 * code may be deployed before it: if the column doesn't exist yet, PostgREST
 * answers 42703 and we fall back to the usual query by `slug` instead of breaking the blog.
 */
// The rest of the page reads post fields without a generated type (title_es, content_en,
// author_name...), so the row is returned as PostgREST gives it.
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
