export const revalidate = 3600;

import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../../dictionaries';
import { notFound } from 'next/navigation';
import Image from "@/components/ui/image";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { canonicalBlogSlug, findBlogPostBySlug } from '@/lib/blog-slugs';
import { relatedServicesForPost } from '@/config/related-content';
import Link from 'next/link';
import { sanitizeBlogHtml } from '@/lib/sanitize-html';
import { StructuredData } from '@/components/seo/structured-data';
import { BreadcrumbNav } from '@/components/seo/breadcrumb-nav';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
  // `slug_es` may not exist yet (the migration is applied by hand): in that case
  // PostgREST fails and only `slug` is used, as before.
  let posts: Array<{ slug: string | null; slug_es?: string | null }> = [];
  const withEs = await supabase
    .from('blog')
    .select('slug, slug_es')
    .eq('published', true);
  if (withEs.error) {
    const { data } = await supabase.from('blog').select('slug').eq('published', true);
    posts = data || [];
  } else {
    posts = withEs.data || [];
  }

  return posts.flatMap((p) => [
    { lang: 'es', slug: canonicalBlogSlug(p, 'es') },
    { lang: 'en', slug: canonicalBlogSlug(p, 'en') },
  ]).filter((p) => p.slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  
  const supabase = createSupabaseClient(
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

  const post = await findBlogPostBySlug(supabase, slug);

  // With blog/loading.tsx the response starts streaming before the render calls
  // notFound(), and a missing slug went out with 200 and "index, follow". Metadata is
  // resolved before anything is sent, so here the 404 does reach the client.
  if (!post) {
    notFound();
  }


  // The canonical always points to the language's slug, even if reached through the other one.
  const canonicalSlug = canonicalBlogSlug(post, lang);

  const title = lang === 'en'
    ? (post.title_en || post.title || '')
    : (post.title_es || post.title || '');

  const excerpt = lang === 'en'
    ? (post.excerpt_en || post.excerpt || '')
    : (post.excerpt_es || post.excerpt || '');

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';
  const url = `${SITE_URL}/${lang}/blog/${canonicalSlug}`;
  const image = post.image_url || `${SITE_URL}/logos/logo-imsoft-blue.png`;
  const publishedTime = post.created_at || new Date().toISOString();
  const modifiedTime = post.updated_at || publishedTime;

  return generateSEOMetadata({
    title,
    description: excerpt,
    url,
    image,
    type: 'article',
    publishedTime,
    modifiedTime,
    author: post.author_name || 'imSoft',
    section: post.category || 'Technology',
    tags: post.tags || [],
    alternateUrls: {
      es: `${SITE_URL}/es/blog/${canonicalBlogSlug(post, 'es')}`,
      en: `${SITE_URL}/en/blog/${canonicalBlogSlug(post, 'en')}`,
    },
  }, lang);
}

export default async function BlogPostPage({ params }: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  // Service-role Supabase client to bypass RLS for now
  // TODO: fix the RLS policies and go back to ANON_KEY
  const supabase = createSupabaseClient(
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

  // Fetch contact info
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

  // Fetch the post by either of its two slugs (es / en)
  const post = await findBlogPostBySlug(supabase, slug);

  if (!post) {
    notFound();
  }

  // Internal links: the service that matches this article (if any).
  const relatedServiceSlugs = relatedServicesForPost(post.slug_es || '');
  const { data: relatedServicesRaw } = relatedServiceSlugs.length
    ? await supabase.from('services').select('slug, title_es, title_en, description_es, description_en').in('slug', relatedServiceSlugs)
    : { data: [] as Array<Record<string, string | null>> };
  const relatedServices = (relatedServicesRaw ?? []).map((s) => ({
    href: `/${lang}/services/${s.slug}`,
    title: (lang === 'en' ? s.title_en : s.title_es) || s.title_es || '',
    description: (lang === 'en' ? s.description_en : s.description_es) || '',
  }));

  // The 301 from the other language's slug to the requested one is NOT done here: this route is
  // prerendered with ISR (`revalidate` above) and a redirect thrown inside a cached
  // render is swallowed, returning 200. It is handled in `next.config.ts`, with the
  // map `blogSlugLanguageRedirects()` builds by reading the DB at build time.
  //
  // Accepting both slugs in the lookup stays as a safety net: if a new post
  // doesn't have its rule yet, the page responds with the right content and the
  // right canonical instead of a 404.

  const isEs = lang === 'es'

  // Get the content for the language
  const title = lang === 'en'
    ? (post.title_en || post.title || '')
    : (post.title_es || post.title || '');

  const content = sanitizeBlogHtml(
    lang === 'en'
      ? (post.content_en || post.content || '')
      : (post.content_es || post.content || '')
  );

  const date = new Date(post.created_at || '').toLocaleDateString(
    lang === 'en' ? 'en-US' : 'es-MX',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';
  const articleUrl = `${SITE_URL}/${lang}/blog/${slug}`;
  const articleImage = post.image_url || `${SITE_URL}/logos/logo-imsoft-blue.png`;
  const publishedTime = post.created_at || new Date().toISOString();
  const modifiedTime = post.updated_at || publishedTime;

  // Get the excerpt for structured data
  const excerpt = lang === 'en'
    ? (post.excerpt_en || post.excerpt || '')
    : (post.excerpt_es || post.excerpt || '');
  
  // Strip HTML from the content to get plain text
  const plainContent = content.replace(/<[^>]*>/g, '').substring(0, 200);

  // Estimated reading time
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const readingLabel = isEs ? `${readingMinutes} min de lectura` : `${readingMinutes} min read`;

  // Author name
  const authorName = post.author_name || 'Brandon Garcia';

  // Category with a readable label
  const categoryLabel = post.category
    ? post.category.charAt(0).toUpperCase() + post.category.slice(1)
    : null;

  // Structured data for Article
  const articleStructuredData = generateStructuredData({
    type: 'Article',
    data: {
      headline: title,
      description: excerpt || plainContent,
      image: articleImage,
      datePublished: publishedTime,
      dateModified: modifiedTime,
      author: post.author_name || 'imSoft',
      url: articleUrl,
      section: post.category || 'Technology',
      keywords: post.tags || [],
    },
  });

  // Breadcrumb structured data
  const breadcrumbStructuredData = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: dict.common?.home ?? 'Home', url: `${SITE_URL}/${lang}` },
        { name: dict.blog?.title ?? 'Blog', url: `${SITE_URL}/${lang}/blog` },
        { name: title, url: articleUrl },
      ],
    },
  });

  return (
    <>
      <StructuredData data={articleStructuredData} id="article-structured-data" />
      <StructuredData data={breadcrumbStructuredData} id="breadcrumb-structured-data" />
      <div>
        <HeroHeader dict={dict} lang={lang} />
        <main className="pt-16">
        <article className="py-8 md:py-12 bg-background">
          <div className="mx-auto max-w-4xl px-6">
            <BreadcrumbNav
              className="mb-8"
              items={[
                { name: isEs ? 'Inicio' : 'Home', href: `/${lang}` },
                { name: 'Blog', href: `/${lang}/blog` },
                { name: title },
              ]}
            />
            {/* Header */}
            <header className="mb-8">
              {/* Category badge */}
              {categoryLabel && (
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                  {categoryLabel}
                </span>
              )}

              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                {title}
              </h1>

              {/* Author + meta row */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Author avatar (initials) */}
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                  {authorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col text-sm leading-tight">
                  <span className="font-semibold text-foreground">{authorName}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <time dateTime={post.created_at}>{date}</time>
                    <span>·</span>
                    <span>{readingLabel}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Featured image */}
            <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
              {post.image_url ? (
                <Image
                  src={post.image_url}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  quality={90}
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-6xl opacity-30">📄</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </article>

        {relatedServices.length > 0 && (
          <section className="py-12 md:py-16 bg-muted/40">
            <div className="mx-auto max-w-4xl px-6">
              <p className="text-sm font-semibold text-primary mb-2">
                {isEs ? 'Servicio relacionado' : 'Related service'}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedServices.map((s) => (
                  <Link key={s.href} href={s.href} className="group rounded-2xl border border-border bg-background p-6 hover:border-primary/50 transition-colors">
                    <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{s.title}</h2>
                    {s.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{s.description}</p>}
                    <span className="mt-4 inline-block text-sm font-semibold text-primary">
                      {isEs ? 'Ver servicio →' : 'View service →'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
    </>
  );
}
