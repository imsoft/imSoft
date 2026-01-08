import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
const SITE_NAME = 'imSoft';
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

  const metaDescription = description || defaultDescription;
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
      languages: {
        'es': `${SITE_URL}/es`,
        'en': `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/es`,
      },
    },
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      locale: lang === 'es' ? 'es_ES' : 'en_US',
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
      // Agregar aquí los códigos de verificación cuando los tengas
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code',
    },
  };
}

export function generateStructuredData(config: {
  type: 'Organization' | 'WebSite' | 'Service' | 'Article' | 'BreadcrumbList' | 'FAQPage';
  data: any;
}): object {
  const { type, data } = config;
  const baseUrl = SITE_URL;

  switch (type) {
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: baseUrl,
        logo: `${baseUrl}/logos/logo-imsoft-blue.png`,
        sameAs: data.socialLinks || [],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: data.phone || '',
          contactType: 'customer service',
          email: data.email || '',
          areaServed: 'MX',
          availableLanguage: ['Spanish', 'English'],
        },
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
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: baseUrl,
        },
        areaServed: {
          '@type': 'Country',
          name: 'Mexico',
        },
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

    default:
      return {};
  }
}

export function getCanonicalUrl(path: string, lang: string): string {
  const baseUrl = SITE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
