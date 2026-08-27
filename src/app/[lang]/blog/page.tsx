export const revalidate = 60;

import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Newspaper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import type { Metadata } from 'next';
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { BlogFilters } from "@/components/blog/blog-filters";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { blogCategoryLabel, isBlogCategory } from "@/lib/blog-categories";

/** Artículos por página. */
const POSTS_PER_PAGE = 9;

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/** Normaliza los parámetros de la URL a filtros seguros para la consulta. */
function parseFilters(searchParams: SearchParams) {
  const rawPage = Number.parseInt(firstValue(searchParams.page) ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawCategory = firstValue(searchParams.categoria ?? searchParams.category);
  const category = rawCategory && isBlogCategory(rawCategory) ? rawCategory : undefined;

  // Se eliminan los caracteres que rompen el filtro `.or()` de PostgREST y los
  // comodines de `ilike`, para que la búsqueda sea siempre literal.
  const query = firstValue(searchParams.q)
    ?.replace(/[,()%*\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || undefined;

  return { page, category, query };
}

function createAdminClient() {
  // Cliente con service role para hacer bypass de RLS temporalmente.
  // TODO: Arreglar las políticas RLS y volver a usar ANON_KEY
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as 'es' | 'en');
  const { page, category, query } = parseFilters(await searchParams);
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

  // La canónica conserva la categoría y la página (son vistas distintas), pero
  // nunca la búsqueda libre, que se marca como noindex.
  const canonicalParams = new URLSearchParams();
  if (category) canonicalParams.set('categoria', category);
  if (page > 1) canonicalParams.set('page', String(page));
  const canonicalSearch = canonicalParams.toString();
  const url = `${SITE_URL}/${lang}/blog${canonicalSearch ? `?${canonicalSearch}` : ''}`;

  const baseTitle = dict.blog?.metaTitle ?? 'Blog';
  const categoryLabel = category ? blogCategoryLabel(category, lang) : undefined;
  const titleParts = [
    categoryLabel ? `${baseTitle} · ${categoryLabel}` : baseTitle,
    page > 1
      ? (dict.blog?.pageLabel ?? 'Page {page}').replace('{page}', String(page))
      : undefined,
  ].filter(Boolean);

  return generateSEOMetadata({
    title: titleParts.join(' – '),
    description: dict.blog?.metaDescription ?? '',
    url,
    type: 'website',
    noindex: Boolean(query),
    tags: lang === 'es'
      ? ['blog', 'tecnología', 'desarrollo', 'artículos']
      : ['blog', 'technology', 'development', 'articles'],
  }, lang);
}

export default async function BlogPage({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const { page, category, query } = parseFilters(await searchParams);

  const supabase = createAdminClient();

  // Obtener datos de contacto
  let contactData = undefined;
  try {
    const { data } = await supabase
      .from('contact')
      .select('*')
      .limit(1)
      .maybeSingle();
    contactData = data || undefined;
  } catch {
    // Error fetching contact data - silently fail
  }

  // Construye la consulta base con los filtros activos (se reutiliza para el
  // conteo y para la página de resultados).
  const buildPostsQuery = ({ head = false }: { head?: boolean } = {}) => {
    let postsQuery = supabase.from('blog').select(
      'id, title_es, title_en, title, excerpt_es, excerpt_en, excerpt, slug, image_url, category, created_at',
      { count: 'exact', head }
    ).eq('published', true);

    if (category) {
      postsQuery = postsQuery.eq('category', category);
    }

    if (query) {
      const pattern = `%${query}%`;
      const columns = lang === 'en'
        ? ['title_en', 'excerpt_en', 'title', 'excerpt']
        : ['title_es', 'excerpt_es', 'title', 'excerpt'];
      postsQuery = postsQuery.or(columns.map((column) => `${column}.ilike.${pattern}`).join(','));
    }

    return postsQuery;
  };

  // Conteos por categoría (solo la columna `category`, sin traer contenido).
  const categoryCountsPromise = supabase
    .from('blog')
    .select('category')
    .eq('published', true);

  // Conteo total con los filtros aplicados, para saber cuántas páginas hay.
  const totalCountPromise = buildPostsQuery({ head: true });

  const [{ data: categoryRows }, { count }] = await Promise.all([
    categoryCountsPromise,
    totalCountPromise,
  ]);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
  // Si piden una página fuera de rango se muestra la última disponible.
  const currentPage = Math.min(page, totalPages);
  const from = (currentPage - 1) * POSTS_PER_PAGE;

  const { data: blogPostsData } = totalCount === 0
    ? { data: [] }
    : await buildPostsQuery()
        .order('created_at', { ascending: false })
        .range(from, from + POSTS_PER_PAGE - 1);

  const categoryCounts = new Map<string, number>();
  for (const row of categoryRows ?? []) {
    const value = (row as { category?: string | null }).category;
    if (!value || !isBlogCategory(value)) continue;
    categoryCounts.set(value, (categoryCounts.get(value) ?? 0) + 1);
  }
  const categories = [...categoryCounts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

  // Mapear los datos del blog al formato esperado
  const blogPosts = (blogPostsData || []).map((post) => ({
    id: post.id,
    title: lang === 'en'
      ? (post.title_en || post.title || '')
      : (post.title_es || post.title || ''),
    excerpt: lang === 'en'
      ? (post.excerpt_en || post.excerpt || '')
      : (post.excerpt_es || post.excerpt || ''),
    date: new Date(post.created_at || '').toLocaleDateString(
      lang === 'en' ? 'en-US' : 'es-MX',
      { year: 'numeric', month: 'long', day: 'numeric' }
    ),
    image: post.image_url || '/logos/logo-imsoft-blue.png',
    slug: post.slug || post.id,
    category: post.category as string | null,
  }));

  const hasFilters = Boolean(category) || Boolean(query);

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

  // Breadcrumb structured data
  const breadcrumbStructuredData = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: dict.common?.home ?? 'Home', url: `${SITE_URL}/${lang}` },
        { name: dict.blog?.title ?? 'Blog', url: `${SITE_URL}/${lang}/blog` },
      ],
    },
  });

  return (
    <>
      <StructuredData data={breadcrumbStructuredData} id="breadcrumb-structured-data" />
      <div>
        <HeroHeader dict={dict} lang={lang} />
        <main className="pt-24">
        <section className="py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="text-center mb-12" direction="up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {dict.blog?.title ?? 'Blog'}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {dict.blog?.subtitle ?? ''}
              </p>
            </ScrollReveal>

            <BlogFilters
              lang={lang}
              dict={dict}
              categories={categories}
              activeCategory={category}
              query={query}
              totalCount={totalCount}
            />

            {blogPosts.length === 0 ? (
              <Empty className="py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Newspaper className="size-12" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {hasFilters
                      ? (dict.blog?.noResults ?? 'No articles match those filters.')
                      : (dict.blog?.noPosts ?? 'No posts available yet.')}
                  </EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post, i) => (
                  <ScrollReveal key={post.id} direction="up" delay={Math.min(i, 5) * 0.06}>
                    <Link
                      href={`/${lang}/blog/${post.slug}`}
                      className="group"
                    >
                      <Card className="overflow-hidden h-full transition-all hover:shadow-xl bg-white dark:bg-gray-900">
                        <div className="relative w-full h-48">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            quality={90}
                            loading={i < 3 ? 'eager' : 'lazy'}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <CardContent className="p-6 flex flex-col grow">
                          {post.category && (
                            <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                              {blogCategoryLabel(post.category, lang)}
                            </span>
                          )}
                          <h3 className="text-2xl font-bold mb-2 text-card-foreground">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 grow">
                            {post.excerpt}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {post.date}
                            </span>
                            <span className="text-sm font-medium text-primary">
                              {dict.blog?.readMore ?? 'Read more'} →
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}

            <BlogPagination
              lang={lang}
              dict={dict}
              currentPage={currentPage}
              totalPages={totalPages}
              category={category}
              query={query}
            />
          </div>
        </section>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
    </>
  );
}
