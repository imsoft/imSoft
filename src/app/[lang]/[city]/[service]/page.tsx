import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeroSectionLanding } from '@/components/landing/hero-section-landing';
import { ProblemsSection } from '@/components/landing/problems-section';
import { SolutionsSection } from '@/components/landing/solutions-section';
import { ServicesSection } from '@/components/blocks/services-section';
import { FooterSection } from '@/components/blocks/footer-section';
import { landingPagesData } from '@/config/landing-pages-data';
import { LANDING_CITIES, LANDING_INDUSTRIES } from '@/config/landing-pages-index';
import { resolveLandingContent } from '@/config/landing-pages-i18n';
import type { City, Industry } from '@/types/landing-pages';
import { getDictionary } from '@/app/[lang]/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { generateStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import { HeroHeader } from '@/components/blocks/hero-section';
import { CityServiceLanding } from '@/components/landing/city-service-landing';
import { CITY_SERVICE_LABELS, cityServiceContent, cityServiceHref, cityServicePages, cityServiceTitle, type CityKey, type CityServiceSlug } from '@/config/city-services';
import { fetchPublishedPosts } from '@/lib/city-service-posts';
import { servicePriceGuide } from '@/config/price-guides';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

interface PageProps {
  params: Promise<{
    lang: string;
    city: string;
    service: string;
  }>;
}

/**
 * Generates every static route at build time.
 * This creates the 30 lang + city + service combinations (15 in Spanish, 15 in English)
 */
export async function generateStaticParams() {
  const langs = ['es', 'en'];
  const cities: City[] = LANDING_CITIES;
  const services: Industry[] = LANDING_INDUSTRIES;

  const params: Array<{ lang: string; city: string; service: string }> = langs.flatMap((lang) =>
    cities.flatMap((city) =>
      services.map((service) => ({
        lang,
        city,
        service,
      }))
    )
  );

  // City + service landings ("paginas web guadalajara"...). Spanish only; the
  // /en version exists to canonicalize to /es and not return 404.
  for (const { city, slug } of cityServicePages()) {
    for (const lang of langs) params.push({ lang, city, service: slug });
  }

  return params;
}


/**
 * Generates dynamic SEO metadata
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, city, service } = await params;

  const cs = cityServiceContent(city, service);
  if (cs) {
    const esUrl = `${SITE}/es/${city}/${service}`;
    return {
      title: cs.seoTitle,
      description: cs.seoDescription,
      alternates: { canonical: esUrl },
      robots: { index: true, follow: true },
      openGraph: { title: cs.seoTitle, description: cs.seoDescription, url: esUrl, siteName: 'imSoft', locale: 'es_MX', type: 'website' },
    };
  }

  // Make sure the combination exists
  if (
    !LANDING_CITIES.includes(city as City) ||
    !landingPagesData[city as City] ||
    !landingPagesData[city as City][service as Industry]
  ) {
    return {
      title: 'Página no encontrada',
    };
  }

  const resolved = resolveLandingContent(lang, city as City, service as Industry)!;
  const pageData = resolved.data;
  const esUrl = `${SITE}/es/${city}/${service}`;

  // If /en is requested and there is no translation yet, the Spanish content is served: the
  // canonical points to /es and no hreflang is declared, to avoid registering a duplicate.
  const canonical = resolved.isTranslated
    ? `${SITE}/${lang}/${city}/${service}`
    : esUrl;

  return {
    title: pageData.seoTitle,
    description: pageData.seoDescription,
    openGraph: {
      title: pageData.seoTitle,
      description: pageData.seoDescription,
      type: 'website',
      locale: lang === 'es' ? 'es_MX' : 'en_US',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'}/${lang}/${city}/${service}`,
      siteName: 'imSoft',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: pageData.h1,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.seoTitle,
      description: pageData.seoDescription,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'}/og-image.jpg`],
    },
    alternates: {
      canonical,
      ...(resolved.isTranslated
        ? {
            languages: {
              'es-MX': esUrl,
              en: `${SITE}/en/${city}/${service}`,
              'x-default': esUrl,
            },
          }
        : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Main page - dynamic landing page
 */
export default async function LandingPage({ params }: PageProps) {
  const { lang, city, service } = await params;

  const cs = cityServiceContent(city, service);
  if (cs) return <CityServicePage lang={lang} city={city as CityKey} slug={service as CityServiceSlug} />;

  // Make sure the city + service combination exists
  if (
    !LANDING_CITIES.includes(city as City) ||
    !landingPagesData[city as City] ||
    !landingPagesData[city as City][service as Industry]
  ) {
    notFound();
  }

  const pageData = resolveLandingContent(lang, city as City, service as Industry)!.data;
  const dict = await getDictionary(lang as 'es' | 'en');
  const supabase = await createClient();

  // Fetch contact info for the footer
  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle();

  // Fetch services from the database
  const { data: services = [] } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageData.seoTitle,
    description: pageData.seoDescription,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'}/${lang}/${city}/${service}`,
    provider: {
      '@type': 'Organization',
      name: 'imSoft',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io',
      logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'}/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Sales',
        availableLanguage: ['es', 'en'],
      },
    },
    about: {
      '@type': 'Service',
      serviceType: 'Software Development',
      areaServed: {
        '@type': 'City',
        name: city === 'cdmx' ? 'Ciudad de México' : city.charAt(0).toUpperCase() + city.slice(1),
      },
    },
  };

  // BreadcrumbList — breadcrumbs in the SERP (Inicio › Servicios › this landing)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';
  const breadcrumbStructuredData = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: lang === 'es' ? 'Inicio' : 'Home', url: `${baseUrl}/${lang}` },
        { name: lang === 'es' ? 'Servicios' : 'Services', url: `${baseUrl}/${lang}/services` },
        { name: pageData.h1, url: `${baseUrl}/${lang}/${city}/${service}` },
      ],
    },
  });

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <StructuredData data={breadcrumbStructuredData} id="breadcrumb-structured-data" />

      <div className="overflow-x-hidden w-full">
        {/* Hero Section */}
        <HeroSectionLanding h1={pageData.h1} subtitle={pageData.heroSubtitle} lang={lang as 'es' | 'en'} dict={dict} />

        {/* Problems Section */}
        <ProblemsSection title={pageData.problems.title} problems={pageData.problems.items} />

        {/* Solutions Section */}
        <SolutionsSection title={pageData.solutions.title} solutions={pageData.solutions.items} />

        {/* Services Section */}
        <ServicesSection dict={dict} lang={lang as 'es' | 'en'} services={services || []} />

        {/* Footer Section */}
        <FooterSection dict={dict} lang={lang as 'es' | 'en'} contactData={contactData || undefined} />
      </div>
    </>
  );
}

/** City + service landing: its own copy per page (see src/config/city-services.ts). */
async function CityServicePage({ lang, city, slug }: { lang: string; city: CityKey; slug: CityServiceSlug }) {
  const content = cityServiceContent(city, slug)!;
  const dict = await getDictionary(lang as 'es' | 'en');
  const supabase = await createClient();
  const { data: contactData } = await supabase.from('contact').select('*').limit(1).maybeSingle();
  const url = `${SITE}/es/${city}/${slug}`;
  const posts = await fetchPublishedPosts(content.relatedPosts ?? []);

  const serviceSchema = generateStructuredData({
    type: 'Service',
    data: { name: content.h1, serviceType: CITY_SERVICE_LABELS[slug], description: content.seoDescription, url },
  });
  const faqSchema = generateStructuredData({ type: 'FAQPage', data: { questions: content.faq.items } });
  const breadcrumbSchema = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: 'Inicio', url: `${SITE}/${lang}` },
        { name: 'Servicios', url: `${SITE}/${lang}/services` },
        { name: content.h1, url },
      ],
    },
  });

  // The other landings in the same city, so Google and visitors find them.
  const related = cityServicePages()
    .filter((p) => p.city === city && p.slug !== slug)
    .map((p) => ({ name: cityServiceTitle(p.city, p.slug), href: cityServiceHref(lang, p.city, p.slug) }));
  if (city === 'guadalajara' && slug === 'paginas-web') related.unshift({ name: 'Páginas web en Zapopan', href: `/${lang}/zapopan/paginas-web` });
  // The service's pricing page: answers the question that holds back someone already comparing.
  const priceGuide = servicePriceGuide(slug);
  if (priceGuide) related.unshift(priceGuide);

  return (
    <div>
      <StructuredData data={serviceSchema} id="city-service-schema" />
      <StructuredData data={faqSchema} id="city-service-faq-schema" />
      <StructuredData data={breadcrumbSchema} id="city-service-breadcrumb-schema" />
      <HeroHeader dict={dict} lang={lang as 'es' | 'en'} />
      <CityServiceLanding
        lang={lang}
        content={content}
        breadcrumb={[{ name: 'Inicio', href: `/${lang}` }, { name: 'Servicios', href: `/${lang}/services` }, { name: content.h1 }]}
        related={related}
        posts={posts.map((p) => ({ title: p.title, href: `/${lang}/blog/${p.slug}` }))}
      />
      <FooterSection dict={dict} lang={lang as 'es' | 'en'} contactData={contactData || undefined} />
    </div>
  );
}
