import { createClient } from '@/lib/supabase/server';

/** Titles of already published blog articles, by slug. Those that don't exist are skipped. */
export async function fetchPublishedPosts(slugs: string[]): Promise<Array<{ slug: string; title: string }>> {
  if (slugs.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('blog').select('slug_es, title_es').eq('published', true).in('slug_es', slugs);
  const titleBySlug = new Map((data ?? []).map((r) => [r.slug_es as string, r.title_es as string]));
  return slugs.filter((s) => titleBySlug.has(s)).map((s) => ({ slug: s, title: titleBySlug.get(s)! }));
}
