import { createClient } from '@/lib/supabase/server';

/** Titulos de articulos del blog ya publicados, por slug. Los que no existan se omiten. */
export async function fetchPublishedPosts(slugs: string[]): Promise<Array<{ slug: string; title: string }>> {
  if (slugs.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('blog').select('slug_es, title_es').eq('published', true).in('slug_es', slugs);
  const porSlug = new Map((data ?? []).map((r) => [r.slug_es as string, r.title_es as string]));
  return slugs.filter((s) => porSlug.has(s)).map((s) => ({ slug: s, title: porSlug.get(s)! }));
}
