import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../../dictionaries';
import { notFound } from 'next/navigation';
import Image from "next/image";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import type { Metadata } from 'next';

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

  const { data: post } = await supabase
    .from('blog')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!post) {
    return generateSEOMetadata({}, lang);
  }

  const title = lang === 'en'
    ? (post.title_en || post.title || '')
    : (post.title_es || post.title || '');

  const excerpt = lang === 'en'
    ? (post.excerpt_en || post.excerpt || '')
    : (post.excerpt_es || post.excerpt || '');

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  const url = `${SITE_URL}/${lang}/blog/${slug}`;
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
      es: `${SITE_URL}/es/blog/${slug}`,
      en: `${SITE_URL}/en/blog/${slug}`,
    },
  }, lang);
}

export default async function BlogPostPage({ params }: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  // Crear cliente de Supabase con service role para bypass RLS temporalmente
  // TODO: Arreglar las políticas RLS y volver a usar ANON_KEY
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

  // Obtener datos de contacto
  let contactData = undefined;
  try {
    const { data } = await supabase
      .from('contact')
      .select('*')
      .limit(1)
      .maybeSingle();
    contactData = data || undefined;
  } catch (error) {
    // Error fetching contact data - silently fail
  }

  // Obtener el post del blog por slug
  const { data: post, error } = await supabase
    .from('blog')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !post) {
    notFound();
  }

  // Obtener el contenido según el idioma
  const title = lang === 'en'
    ? (post.title_en || post.title || '')
    : (post.title_es || post.title || '');

  const content = lang === 'en'
    ? (post.content_en || post.content || '')
    : (post.content_es || post.content || '');

  const date = new Date(post.created_at || '').toLocaleDateString(
    lang === 'en' ? 'en-US' : 'es-MX',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  const articleUrl = `${SITE_URL}/${lang}/blog/${slug}`;
  const articleImage = post.image_url || `${SITE_URL}/logos/logo-imsoft-blue.png`;
  const publishedTime = post.created_at || new Date().toISOString();
  const modifiedTime = post.updated_at || publishedTime;

  // Obtener excerpt para structured data
  const excerpt = lang === 'en'
    ? (post.excerpt_en || post.excerpt || '')
    : (post.excerpt_es || post.excerpt || '');
  
  // Limpiar HTML del contenido para obtener texto plano
  const plainContent = content.replace(/<[^>]*>/g, '').substring(0, 200);

  // Structured data para Article
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
        { name: lang === 'es' ? 'Inicio' : 'Home', url: `${SITE_URL}/${lang}` },
        { name: lang === 'es' ? 'Blog' : 'Blog', url: `${SITE_URL}/${lang}/blog` },
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
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime={post.created_at}>{date}</time>
                {post.category && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{post.category}</span>
                  </>
                )}
              </div>
            </header>

            {/* Featured image */}
            {post.image_url && (
              <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
                <Image
                  src={post.image_url}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </article>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
    </>
  );
}
