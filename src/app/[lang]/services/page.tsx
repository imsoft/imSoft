import { ServicesSection } from "@/components/blocks/services-section";
import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return generateSEOMetadata({
    title: lang === 'es'
      ? 'Servicios de Desarrollo de Software y Consultoría Tecnológica'
      : 'Software Development & Technology Consulting Services',
    description: lang === 'es'
      ? 'Descubre nuestros servicios: desarrollo web, aplicaciones móviles, consultoría tecnológica y transformación digital. Soluciones a medida para tu empresa.'
      : 'Explore our services: web development, mobile apps, technology consulting and digital transformation. Custom solutions for your business.',
    url: `${SITE_URL}/${lang}/services`,
    type: 'website',
    tags: lang === 'es'
      ? ['desarrollo de software', 'consultoría tecnológica', 'transformación digital', 'desarrollo web', 'aplicaciones móviles']
      : ['software development', 'technology consulting', 'digital transformation', 'web development', 'mobile apps'],
    alternateUrls: {
      es: `${SITE_URL}/es/services`,
      en: `${SITE_URL}/en/services`,
    },
  }, lang);
}

export default async function ServicesPage({ params }: {
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

  // Obtener servicios de la base de datos
  const { data: services = [] } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <div>
      <HeroHeader dict={dict} lang={lang} />
      <main className="pt-24">
        <ServicesSection dict={dict} lang={lang} services={services || []} />
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}

