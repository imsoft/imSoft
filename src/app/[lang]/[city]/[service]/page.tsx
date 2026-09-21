import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeroSectionLanding } from '@/components/landing/hero-section-landing';
import { ProblemsSection } from '@/components/landing/problems-section';
import { SolutionsSection } from '@/components/landing/solutions-section';
import { ServicesSection } from '@/components/blocks/services-section';
import { FooterSection } from '@/components/blocks/footer-section';
import { landingPagesData } from '@/config/landing-pages-data';
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

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

interface PageProps {
  params: Promise<{
    lang: string;
    city: string;
    service: string;
  }>;
}

/**
 * Genera todas las rutas estáticas en build time
 * Esto crea las 30 combinaciones de lang + ciudad + servicio (15 en español, 15 en inglés)
 */
export async function generateStaticParams() {
  const langs = ['es', 'en'];
  const cities: City[] = ['guadalajara', 'cdmx', 'monterrey'];
  const services: Industry[] = [
    'software-para-inmobiliarias',
    'software-para-constructoras',
    'software-para-restaurantes',
    'software-para-clinicas',
    'software-para-logistica',
  ];

  const params: Array<{ lang: string; city: string; service: string }> = langs.flatMap((lang) =>
    cities.flatMap((city) =>
      services.map((service) => ({
        lang,
        city,
        service,
      }))
    )
  );

  // Landings de ciudad + servicio ("paginas web guadalajara"...). Solo en español; la
  // version /en existe para canonicalizar a /es y no dar 404.
  for (const { city, slug } of cityServicePages()) {
    for (const lang of langs) params.push({ lang, city, service: slug });
  }

  return params;
}


/**
 * Genera metadata dinámica para SEO
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

  // Validar que la combinación exista
  if (
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

  // Si se pidio /en y aun no hay traduccion, se sirve el contenido en español: la
  // canonica apunta a /es y no se declara hreflang, para no registrar un duplicado.
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
 * Página principal - Landing page dinámica
 */
export default async function LandingPage({ params }: PageProps) {
  const { lang, city, service } = await params;

  const cs = cityServiceContent(city, service);
  if (cs) return <CityServicePage lang={lang} city={city as CityKey} slug={service as CityServiceSlug} />;

  // Validar que la combinación ciudad + servicio exista
  if (
    !landingPagesData[city as City] ||
    !landingPagesData[city as City][service as Industry]
  ) {
    notFound();
  }

  const pageData = resolveLandingContent(lang, city as City, service as Industry)!.data;
  const dict = await getDictionary(lang as 'es' | 'en');
  const supabase = await createClient();

  // Obtener datos de contacto para el footer
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

  // Structured Data para SEO
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

  // BreadcrumbList — migas de pan en el SERP (Inicio › Servicios › esta landing)
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

/** Landing de ciudad + servicio: texto propio por pagina (ver src/config/city-services.ts). */
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

  // Las otras landings de la misma ciudad, para que Google y el visitante las encuentren.
  const related = cityServicePages()
    .filter((p) => p.city === city && p.slug !== slug)
    .map((p) => ({ name: cityServiceTitle(p.city, p.slug), href: cityServiceHref(lang, p.city, p.slug) }));
  if (city === 'guadalajara' && slug === 'paginas-web') related.unshift({ name: 'Páginas web en Zapopan', href: `/${lang}/zapopan/paginas-web` });

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
