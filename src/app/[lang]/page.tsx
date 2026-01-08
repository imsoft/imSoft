import { HeroSection } from "@/components/blocks/hero-section";
import { ServicesSection } from "@/components/blocks/services-section";
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
  
  return generateSEOMetadata({
    title: lang === 'es' 
      ? 'Soluciones Tecnológicas Modernas para Empresas'
      : 'Modern Technology Solutions for Businesses',
    description: lang === 'es'
      ? 'Desarrollo de software, consultoría tecnológica y servicios de transformación digital. Soluciones personalizadas para hacer crecer tu negocio.'
      : 'Software development, technology consulting and digital transformation services. Custom solutions to grow your business.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'}/${lang}`,
    type: 'website',
  }, lang);
}

export default async function Home({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();
  
  // Obtener datos de contacto
  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle();

  // Obtener testimonios con información de empresas
  const { data: testimonials = [] } = await supabase
    .from('testimonials')
    .select(`
      id,
      company,
      company_id,
      content_es,
      content_en,
      content,
      companies (
        name,
        logo_url
      )
    `)
    .order('created_at', { ascending: false });

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

  // Obtener proyectos de portafolio
  const { data: portfolioData } = await supabase
    .from('portfolio')
    .select('*')
    .order('created_at', { ascending: false });

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

  // Obtener logos de empresas/clientes
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, logo_url')
    .not('logo_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(8);

  // Obtener posts del blog para mostrar títulos aleatorios
  // Usar cliente de administrador para evitar problemas de RLS
  let blogPosts = null;
  let blogError = null;
  
  try {
    const adminSupabase = createAdminClient();
    const result = await adminSupabase
      .from('blog')
      .select('id, title_es, title_en, title, slug')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    blogPosts = result.data;
    blogError = result.error;
  } catch (error) {
    console.error('Error creating admin client:', error);
    // Fallback: intentar con el cliente normal
    const result = await supabase
      .from('blog')
      .select('id, title_es, title_en, title, slug')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    blogPosts = result.data;
    blogError = result.error;
  }

  if (blogError) {
    console.error('Error fetching blog posts:', blogError);
  }

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

  return (
    <>
      <StructuredData data={websiteStructuredData} id="website-structured-data" />
      <StructuredData data={organizationStructuredData} id="organization-structured-data" />
      <div className="overflow-x-hidden w-full">
        <HeroSection dict={dict} lang={lang} companies={companies || []} portfolioProjects={projects} blogTitles={blogTitles} />
        <ServicesSection dict={dict} lang={lang} />
        <PortfolioSection dict={dict} lang={lang} projects={projects} />
        <TestimonialsSection dict={dict} lang={lang} testimonials={formattedTestimonials} />
        <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
      </div>
    </>
  );
}

