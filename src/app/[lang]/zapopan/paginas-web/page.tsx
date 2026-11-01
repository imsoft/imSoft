import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeroHeader } from '@/components/blocks/hero-section';
import { FooterSection } from '@/components/blocks/footer-section';
import { CityServiceLanding } from '@/components/landing/city-service-landing';
import type { CityServiceContent } from '@/config/city-services';
import { StructuredData } from '@/components/seo/structured-data';
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { generateStructuredData } from '@/lib/seo';
import { ZAPOPAN_FAQ, ZAPOPAN_WEB } from '@/config/zapopan-web';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';
const ES_URL = `${SITE_URL}/es/zapopan/paginas-web`;

/**
 * Websites landing for Zapopan.
 *
 * It is a static route inside [lang], so it wins over the dynamic [city]/[service]:
 * Next gives precedence to the literal segment. That is why `zapopan` doesn't need to be
 * in `landingPagesData`, which is for city + industry combinations.
 *
 * Spanish only. The content targets local searches ("desarrollo web Zapopan") that have
 * no volume in English, so /en canonicalizes to /es and stays out of the English
 * sitemap, like the untranslated landings.
 */

export function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === 'es';

  return {
    title: ZAPOPAN_WEB.seoTitle,
    description: ZAPOPAN_WEB.seoDescription,
    alternates: {
      // No English version: /en points to Spanish to avoid registering a duplicate.
      canonical: isEs ? ES_URL : ES_URL,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: ZAPOPAN_WEB.seoTitle,
      description: ZAPOPAN_WEB.seoDescription,
      url: ES_URL,
      siteName: 'imSoft',
      locale: 'es_MX',
      type: 'website',
      images: [{ url: `${SITE_URL}/logos/logo-imsoft-blue.png`, width: 1200, height: 630, alt: ZAPOPAN_WEB.h1 }],
    },
  };
}

export default async function ZapopanWebPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();
  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle();

  const serviceSchema = generateStructuredData({
    type: 'Service',
    data: {
      name: ZAPOPAN_WEB.h1,
      serviceType: 'Diseño y desarrollo de páginas web',
      description: ZAPOPAN_WEB.seoDescription,
      url: ES_URL,
    },
  });

  const breadcrumbSchema = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: 'Inicio', url: `${SITE_URL}/${lang}` },
        { name: 'Zapopan', url: ES_URL },
        { name: ZAPOPAN_WEB.h1, url: ES_URL },
      ],
    },
  });

  return (
    <div>
      <StructuredData data={serviceSchema} id="zapopan-service-schema" />
      <StructuredData data={breadcrumbSchema} id="zapopan-breadcrumb-schema" />
      <HeroHeader dict={dict} lang={lang} />

      <CityServiceLanding
        lang={lang}
        content={{ ...(ZAPOPAN_WEB as unknown as Omit<CityServiceContent, 'faq'>), faq: ZAPOPAN_FAQ }}
        breadcrumb={[{ name: 'Inicio', href: `/${lang}` }, { name: 'Servicios', href: `/${lang}/services` }, { name: 'Páginas web en Zapopan' }]}
        related={[{ name: 'Páginas web en Guadalajara', href: `/${lang}/guadalajara/paginas-web` }]}
      />

      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}
