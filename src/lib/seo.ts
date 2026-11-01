import { Metadata } from 'next';
import { BUSINESS_AREA_SERVED } from '@/config/business';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';
const SITE_NAME = 'imSoft';

/** Countries where we offer service (schema.org / consistency with international SEO). */
export const SEO_AREA_SERVED_COUNTRIES = [
  { '@type': 'Country', name: 'Mexico' },
  { '@type': 'Country', name: 'United States' },
  { '@type': 'Country', name: 'Canada' },
  { '@type': 'Country', name: 'Germany' },
] as const;

/**
 * Hreflang for a bilingual site: Spanish aimed at Mexico (es-MX) and generic English (en)
 * for searches in the US, Canada, Germany, etc. x-default = main version (ES).
 */
export function hreflangLanguageAlternates(esUrl: string, enUrl: string): Record<string, string> {
  return {
    'es-MX': esUrl,
    en: enUrl,
    'x-default': esUrl,
  };
}
const DEFAULT_DESCRIPTION_ES = 'Soluciones tecnológicas modernas para empresas. Desarrollo de software, consultoría tecnológica y servicios de transformación digital.';
const DEFAULT_DESCRIPTION_EN = 'Modern technological solutions for businesses. Software development, technology consulting and digital transformation services.';

export interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  alternateUrls?: {
    es?: string;
    en?: string;
  };
}

/**
 * Google shows ~155 characters of the meta description. It's cut at the last full
 * word and marked with an ellipsis so no sentence is left halfway.
 */
export function truncateDescription(text: string, max = 155): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.lastIndexOf(' ', max - 1);
  return `${clean.slice(0, cut > 60 ? cut : max - 1).replace(/[,;:.]$/, '')}…`;
}

export function generateMetadata(config: SEOConfig, lang: string = 'es'): Metadata {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    noindex = false,
    nofollow = false,
    alternateUrls,
  } = config;

  const defaultTitle = lang === 'es' 
    ? `${SITE_NAME} - Soluciones Tecnológicas Modernas`
    : `${SITE_NAME} - Modern Technology Solutions`;
  
  const defaultDescription = lang === 'es' 
    ? DEFAULT_DESCRIPTION_ES 
    : DEFAULT_DESCRIPTION_EN;

  const fullTitle = title 
    ? `${title} | ${SITE_NAME}`
    : defaultTitle;

  const metaDescription = truncateDescription(description || defaultDescription);
  const canonicalUrl = url || `${SITE_URL}/${lang}`;
  const ogImage = image || `${SITE_URL}/logos/logo-imsoft-blue.png`;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: tags?.join(', ') || (lang === 'es' 
      ? 'desarrollo de software, consultoría tecnológica, transformación digital, imSoft'
      : 'software development, technology consulting, digital transformation, imSoft'),
    authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
      languages: alternateUrls
        ? hreflangLanguageAlternates(
            alternateUrls.es || `${SITE_URL}/es`,
            alternateUrls.en || `${SITE_URL}/en`,
          )
        : hreflangLanguageAlternates(`${SITE_URL}/es`, `${SITE_URL}/en`),
    },
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      locale: lang === 'es' ? 'es_MX' : 'en_US',
      alternateLocale: lang === 'es' ? ['en_US'] : ['es_MX'],
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: fullTitle,
      description: metaDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : [SITE_NAME],
        section,
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [ogImage],
      creator: `@${SITE_NAME.toLowerCase()}`,
      site: `@${SITE_NAME.toLowerCase()}`,
    },
    metadataBase: new URL(SITE_URL),
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      other: {
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
      },
    },
  };
}

export function generateStructuredData(config: {
  type: 'Organization' | 'WebSite' | 'Service' | 'Article' | 'BreadcrumbList' | 'FAQPage' | 'LocalBusiness';
  data: any;
}): object {
  const { type, data } = config;
  const baseUrl = SITE_URL;

  switch (type) {
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: SITE_NAME,
        url: baseUrl,
        logo: `${baseUrl}/logos/logo-imsoft-blue.png`,
        sameAs: data.socialLinks || [],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: data.phone || '',
          contactType: 'customer service',
          email: data.email || '',
          availableLanguage: ['Spanish', 'English'],
        },
        areaServed: [...SEO_AREA_SERVED_COUNTRIES],
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'MX',
          addressLocality: data.city || '',
          addressRegion: data.state || '',
        },
      };

    case 'WebSite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: data.languages || ['es', 'en'],
      };

    case 'Service':
      return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: data.serviceType || 'Technology Consulting',
        // Provider described inline, NOT as a `{'@id': ...}` reference. Verified
        // in production: when another block of the page references the business node by @id,
        // validator.schema.org drops that whole node without any error and
        // the company disappears from the detected entities. Repeating two fields
        // is cheaper than risking the business listing becoming invisible.
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: baseUrl,
        },
        // The service area is the business's real one (ZMG + Jalisco + Mexico), not the
        // list of countries it aspires to sell to.
        areaServed: [...BUSINESS_AREA_SERVED],
        description: data.description || '',
        name: data.name || '',
        url: data.url || baseUrl,
        image: data.image || `${baseUrl}/logos/logo-imsoft-blue.png`,
      };

    case 'Article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.headline || '',
        description: data.description || '',
        image: data.image || `${baseUrl}/logos/logo-imsoft-blue.png`,
        datePublished: data.datePublished || '',
        dateModified: data.dateModified || data.datePublished || '',
        author: {
          '@type': 'Person',
          name: data.author || SITE_NAME,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logos/logo-imsoft-blue.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url || baseUrl,
        },
        articleSection: data.section || 'Technology',
        keywords: data.keywords || [],
      };

    case 'BreadcrumbList':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };

    case 'FAQPage':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions.map((q: any) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      };

    case 'LocalBusiness':
      return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': data.url || baseUrl,
        name: data.name || SITE_NAME,
        description: data.description || '',
        url: data.url || baseUrl,
        image: data.image || `${baseUrl}/logos/logo-imsoft-blue.png`,
        telephone: data.phone || '',
        email: data.email || '',
        priceRange: data.priceRange || '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.city || '',
          addressRegion: data.state || '',
          addressCountry: 'MX',
        },
        geo: data.geo ? {
          '@type': 'GeoCoordinates',
          latitude: data.geo.latitude,
          longitude: data.geo.longitude,
        } : undefined,
        areaServed: {
          '@type': 'City',
          name: data.city || '',
        },
        serviceArea: data.serviceArea ? {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: data.geo?.latitude,
            longitude: data.geo?.longitude,
          },
          geoRadius: '50000', // 50km radius
        } : undefined,
        openingHours: data.openingHours || 'Mo-Fr 09:00-18:00',
        sameAs: data.socialLinks || [],
      };

    default:
      return {};
  }
}

export function getCanonicalUrl(path: string): string {
  const baseUrl = SITE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Helper to get city info for the LocalBusiness schema
export function getCityInfo(city: string): {
  displayName: { es: string; en: string };
  state: string;
  geo?: { latitude: number; longitude: number };
} {
  const cities: Record<string, any> = {
    guadalajara: {
      displayName: { es: 'Guadalajara', en: 'Guadalajara' },
      state: 'Jalisco',
      geo: { latitude: 20.6597, longitude: -103.3496 },
    },
    cdmx: {
      displayName: { es: 'Ciudad de México', en: 'Mexico City' },
      state: 'CDMX',
      geo: { latitude: 19.4326, longitude: -99.1332 },
    },
    monterrey: {
      displayName: { es: 'Monterrey', en: 'Monterrey' },
      state: 'Nuevo León',
      geo: { latitude: 25.6866, longitude: -100.3161 },
    },
  };

  return cities[city] || {
    displayName: { es: city, en: city },
    state: '',
  };
}
