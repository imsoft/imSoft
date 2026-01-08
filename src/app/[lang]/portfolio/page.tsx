import { PortfolioGrid } from "@/components/blocks/portfolio-grid";
import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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
  const url = `${SITE_URL}/${lang}/portfolio`;

  return generateSEOMetadata({
    title: lang === 'es' 
      ? 'Portafolio - Proyectos y Casos de Éxito'
      : 'Portfolio - Projects and Success Cases',
    description: lang === 'es'
      ? 'Explora nuestro portafolio de proyectos exitosos. Desarrollo de software, aplicaciones web y soluciones tecnológicas personalizadas.'
      : 'Explore our portfolio of successful projects. Software development, web applications and custom technology solutions.',
    url,
    type: 'website',
    tags: lang === 'es' 
      ? ['portafolio', 'proyectos', 'casos de éxito', 'desarrollo']
      : ['portfolio', 'projects', 'success cases', 'development'],
  }, lang);
}

export default async function PortfolioPage({ params }: {
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
    project_url: project.project_url,
  }));

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  
  // Breadcrumb structured data
  const breadcrumbStructuredData = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: lang === 'es' ? 'Inicio' : 'Home', url: `${SITE_URL}/${lang}` },
        { name: lang === 'es' ? 'Portafolio' : 'Portfolio', url: `${SITE_URL}/${lang}/portfolio` },
      ],
    },
  });

  return (
    <>
      <StructuredData data={breadcrumbStructuredData} id="breadcrumb-structured-data" />
      <div>
        <HeroHeader dict={dict} lang={lang} />
        <main className="pt-24">
        <PortfolioGrid dict={dict} lang={lang} projects={projects} />
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
    </>
  );
}

