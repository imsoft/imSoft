import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeroSectionLanding } from '@/components/landing/hero-section-landing';
import { ProblemsSection } from '@/components/landing/problems-section';
import { SolutionsSection } from '@/components/landing/solutions-section';
import { ServicesSectionLanding } from '@/components/landing/services-section-landing';
import { CTASection } from '@/components/landing/cta-section';
import { landingPagesData } from '@/config/landing-pages-data';
import type { City, Industry } from '@/types/landing-pages';

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

  const params = langs.flatMap((lang) =>
    cities.flatMap((city) =>
      services.map((service) => ({
        lang,
        city,
        service,
      }))
    )
  );

  return params;
}

/**
 * Genera metadata dinámica para SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, city, service } = await params;

  // Validar que la combinación exista
  if (
    !landingPagesData[city as City] ||
    !landingPagesData[city as City][service as Industry]
  ) {
    return {
      title: 'Página no encontrada',
    };
  }

  const pageData = landingPagesData[city as City][service as Industry];

  return {
    title: pageData.seoTitle,
    description: pageData.seoDescription,
    openGraph: {
      title: pageData.seoTitle,
      description: pageData.seoDescription,
      type: 'website',
      locale: lang === 'es' ? 'es_MX' : 'en_US',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'}/${lang}/${city}/${service}`,
      siteName: 'imSoft',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'}/og-image.jpg`,
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
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'}/og-image.jpg`],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'}/${lang}/${city}/${service}`,
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

  // Validar que la combinación ciudad + servicio exista
  if (
    !landingPagesData[city as City] ||
    !landingPagesData[city as City][service as Industry]
  ) {
    notFound();
  }

  const pageData = landingPagesData[city as City][service as Industry];

  // Structured Data para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageData.seoTitle,
    description: pageData.seoDescription,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'}/${lang}/${city}/${service}`,
    provider: {
      '@type': 'Organization',
      name: 'imSoft',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io',
      logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'}/logo.png`,
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

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Hero Section */}
      <HeroSectionLanding h1={pageData.h1} subtitle={pageData.heroSubtitle} lang={lang} />

      {/* Problems Section */}
      <ProblemsSection title={pageData.problems.title} problems={pageData.problems.items} />

      {/* Solutions Section */}
      <SolutionsSection title={pageData.solutions.title} solutions={pageData.solutions.items} />

      {/* Services Section */}
      <ServicesSectionLanding
        title={pageData.imSoftServices.title}
        description={pageData.imSoftServices.description}
        services={pageData.imSoftServices.services}
      />

      {/* CTA Section */}
      <CTASection
        title={pageData.cta.title}
        description={pageData.cta.description}
        buttonText={pageData.cta.buttonText}
        lang={lang}
      />
    </>
  );
}
