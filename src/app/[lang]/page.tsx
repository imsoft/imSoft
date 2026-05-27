import { HeroSection } from "@/components/blocks/hero-section";
import { ServicesSection } from "@/components/blocks/services-section";
import { PricingSection } from "@/components/blocks/pricing-section";
import { PortfolioSection } from "@/components/blocks/portfolio-section";
import { TestimonialsSection } from "@/components/blocks/testimonials-section";
import { FooterSection } from "@/components/blocks/footer-section";
import { getDictionary, hasLocale } from './dictionaries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';

  return generateSEOMetadata({
    title: lang === 'es'
      ? 'Soluciones Tecnológicas Modernas para Empresas'
      : 'Modern Technology Solutions for Businesses',
    description: lang === 'es'
      ? 'Desarrollo de software, consultoría tecnológica y servicios de transformación digital. Soluciones personalizadas para hacer crecer tu negocio.'
      : 'Software development, technology consulting and digital transformation services. Custom solutions to grow your business.',
    url: `${SITE_URL}/${lang}`,
    type: 'website',
    alternateUrls: {
      es: `${SITE_URL}/es`,
      en: `${SITE_URL}/en`,
    },
  }, lang);
}

// Revalidar la página cada 5 minutos para mantener datos frescos sin golpear Supabase en cada request
export const revalidate = 300;

export default async function Home({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const [dict, supabase] = await Promise.all([
    getDictionary(lang),
    createClient(),
  ]);

  // Todas las queries en paralelo para eliminar el waterfall de red
  const [
    { data: contactData },
    { data: testimonials },
    { data: portfolioData },
    { data: companies },
    { data: services },
    blogResult,
  ] = await Promise.all([
    supabase.from('contact').select('*').limit(1).maybeSingle(),
    supabase
      .from('testimonials')
      .select(`id, company, company_id, content_es, content_en, content, companies ( name, logo_url )`)
      .order('created_at', { ascending: false }),
    supabase.from('portfolio').select('*').order('created_at', { ascending: false }),
    supabase
      .from('companies')
      .select('id, name, logo_url')
      .not('logo_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('services').select('*').order('created_at', { ascending: true }),
    // Blog: intentar con admin client para bypass RLS
    (async () => {
      try {
        const adminSupabase = createAdminClient();
        return adminSupabase
          .from('blog')
          .select('id, title_es, title_en, title, slug')
          .eq('published', true)
          .order('created_at', { ascending: false });
      } catch {
        return supabase
          .from('blog')
          .select('id, title_es, title_en, title, slug')
          .eq('published', true)
          .order('created_at', { ascending: false });
      }
    })(),
  ]);

  if (blogResult.error) {
    console.error('Error fetching blog posts:', blogResult.error);
  }

  const blogPosts = blogResult.data;

  // Formatear testimonios para incluir logo de empresa
  const formattedTestimonials = (testimonials || []).map((testimonial: any) => ({
    id: testimonial.id,
    company: testimonial.companies?.name || testimonial.company || '',
    company_id: testimonial.company_id,
    company_logo_url: testimonial.companies?.logo_url,
    content_es: testimonial.content_es,
    content_en: testimonial.content_en,
    content: testimonial.content,
  }));

  // Mapear los proyectos según el idioma
  const projects = (portfolioData || []).map((project) => ({
    id: project.id,
    title: lang === 'en'
      ? (project.title_en || project.title || '')
      : (project.title_es || project.title || ''),
    description: lang === 'en'
      ? (project.description_en || project.description || '')
      : (project.description_es || project.description || ''),
    image: project.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  }));

  // Mapear los títulos según el idioma
  const blogTitles = (blogPosts || []).map((post) => {
    const title = lang === 'en'
      ? (post.title_en || post.title || '')
      : (post.title_es || post.title || '');
    return {
      id: post.id,
      title: title,
      slug: post.slug || post.id,
    };
  });

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  
  // Structured data para WebSite
  const websiteStructuredData = generateStructuredData({
    type: 'WebSite',
    data: {
      languages: ['es', 'en'],
    },
  });

  // Structured data para Organization con datos de contacto
  const organizationStructuredData = generateStructuredData({
    type: 'Organization',
    data: {
      email: contactData?.email || '',
      phone: contactData?.phone || '',
      city: contactData?.city || '',
      state: contactData?.state || '',
      socialLinks: [
        contactData?.facebook,
        contactData?.twitter,
        contactData?.instagram,
        contactData?.linkedin,
        contactData?.youtube,
      ].filter(Boolean) as string[],
    },
  });

  // Structured data Reviews — testimonios como schema Review
  const reviewsStructuredData = formattedTestimonials.length > 0
    ? generateStructuredData({
        type: 'ReviewList',
        data: {
          reviews: formattedTestimonials.map((t) => ({
            company: t.company,
            content: lang === 'en'
              ? (t.content_en || t.content || '')
              : (t.content_es || t.content || ''),
          })),
        },
      })
    : null;

  // Structured data LocalBusiness — refuerza posicionamiento local
  const localBusinessStructuredData = generateStructuredData({
    type: 'LocalBusiness',
    data: {
      name: 'imSoft',
      description: lang === 'es'
        ? 'Desarrollo de software, consultoría tecnológica y transformación digital para empresas.'
        : 'Software development, technology consulting and digital transformation for businesses.',
      url: `${SITE_URL}/${lang}`,
      image: `${SITE_URL}/logos/logo-imsoft-blue.png`,
      phone: contactData?.phone || '',
      email: contactData?.email || '',
      city: 'Guadalajara',
      state: 'Jalisco',
      geo: { latitude: 20.6597, longitude: -103.3496 },
      priceRange: '$$',
      openingHours: 'Mo-Fr 09:00-18:00',
      socialLinks: [
        contactData?.facebook,
        contactData?.instagram,
        contactData?.linkedin,
      ].filter(Boolean) as string[],
      serviceArea: true,
    },
  });

  return (
    <>
      <StructuredData data={websiteStructuredData} id="website-structured-data" />
      <StructuredData data={organizationStructuredData} id="organization-structured-data" />
      <StructuredData data={localBusinessStructuredData} id="local-business-structured-data" />
      {reviewsStructuredData && <StructuredData data={reviewsStructuredData} id="reviews-structured-data" />}
      <div className="overflow-x-hidden w-full">
        <HeroSection dict={dict} lang={lang} companies={companies || []} portfolioProjects={projects} blogTitles={blogTitles} />
        <ServicesSection dict={dict} lang={lang} services={services || []} />
        <PricingSection dict={dict} lang={lang} />
        <PortfolioSection dict={dict} lang={lang} projects={projects} />
        <TestimonialsSection dict={dict} lang={lang} testimonials={formattedTestimonials} />
        <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
      </div>
    </>
  );
}

