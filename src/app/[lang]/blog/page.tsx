import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as 'es' | 'en');
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  const url = `${SITE_URL}/${lang}/blog`;

  return generateSEOMetadata({
    title: dict.blog?.metaTitle ?? 'Blog',
    description: dict.blog?.metaDescription ?? '',
    url,
    type: 'website',
    tags: lang === 'es'
      ? ['blog', 'tecnología', 'desarrollo', 'artículos']
      : ['blog', 'technology', 'development', 'articles'],
  }, lang);
}

export default async function BlogPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

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

  // Obtener posts del blog publicados
  const { data: blogPostsData } = await supabase
    .from('blog')
    .select('id, title_es, title_en, title, excerpt_es, excerpt_en, excerpt, slug, image_url, created_at, published')
    .eq('published', true)
    .order('created_at', { ascending: false });

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
    image: post.image_url || '/placeholder-blog.jpg',
    slug: post.slug || post.id,
  }));

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  
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
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {dict.blog?.title ?? 'Blog'}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {dict.blog?.subtitle ?? ''}
              </p>
            </div>
            
            {blogPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  {dict.blog?.noPosts ?? 'No posts available yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <Link
                    key={post.id}
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
                        />
                      </div>
                      <CardContent className="p-6 flex flex-col grow">
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
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
    </>
  );
}

