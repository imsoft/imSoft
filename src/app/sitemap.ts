import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hreflangLanguageAlternates } from '@/lib/seo';
import { LANDING_CITIES, LANDING_INDUSTRIES } from '@/config/landing-pages-index';
import { hasEnglishLanding } from '@/config/landing-pages-i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

/**
 * El sitemap se prerenderizaba en build y se quedaba congelado hasta el siguiente
 * deploy: los articulos que publica el cron semanal no aparecian hasta que alguien
 * volviera a desplegar. Se regenera cada hora.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Intentar usar cliente de administrador primero para evitar problemas de RLS
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    // Fallback al cliente normal si no hay SERVICE_ROLE_KEY
    supabase = await createClient();
  }
  
  const routes: MetadataRoute.Sitemap = [
    // Páginas principales
    {
      url: `${SITE_URL}/es`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: hreflangLanguageAlternates(`${SITE_URL}/es`, `${SITE_URL}/en`),
      },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: hreflangLanguageAlternates(`${SITE_URL}/es`, `${SITE_URL}/en`),
      },
    },
    {
      url: `${SITE_URL}/es/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/services`,
          `${SITE_URL}/en/services`,
        ),
      },
    },
    {
      url: `${SITE_URL}/en/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/services`,
          `${SITE_URL}/en/services`,
        ),
      },
    },
    {
      url: `${SITE_URL}/es/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/portfolio`,
          `${SITE_URL}/en/portfolio`,
        ),
      },
    },
    {
      url: `${SITE_URL}/en/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/portfolio`,
          `${SITE_URL}/en/portfolio`,
        ),
      },
    },
    {
      url: `${SITE_URL}/es/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: hreflangLanguageAlternates(`${SITE_URL}/es/blog`, `${SITE_URL}/en/blog`),
      },
    },
    {
      url: `${SITE_URL}/en/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: hreflangLanguageAlternates(`${SITE_URL}/es/blog`, `${SITE_URL}/en/blog`),
      },
    },
    {
      url: `${SITE_URL}/es/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/contact`,
          `${SITE_URL}/en/contact`,
        ),
      },
    },
    {
      url: `${SITE_URL}/en/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/contact`,
          `${SITE_URL}/en/contact`,
        ),
      },
    },
    {
      url: `${SITE_URL}/es/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: hreflangLanguageAlternates(`${SITE_URL}/es/about`, `${SITE_URL}/en/about`),
      },
    },
    {
      url: `${SITE_URL}/en/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: hreflangLanguageAlternates(`${SITE_URL}/es/about`, `${SITE_URL}/en/about`),
      },
    },
    {
      url: `${SITE_URL}/es/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/cookie-policy`,
          `${SITE_URL}/en/cookie-policy`,
        ),
      },
    },
    {
      url: `${SITE_URL}/en/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/cookie-policy`,
          `${SITE_URL}/en/cookie-policy`,
        ),
      },
    },
    {
      url: `${SITE_URL}/es/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/terms-and-conditions`,
          `${SITE_URL}/en/terms-and-conditions`,
        ),
      },
    },
    {
      url: `${SITE_URL}/en/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/terms-and-conditions`,
          `${SITE_URL}/en/terms-and-conditions`,
        ),
      },
    },
    {
      url: `${SITE_URL}/es/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/privacy-policy`,
          `${SITE_URL}/en/privacy-policy`,
        ),
      },
    },
    {
      url: `${SITE_URL}/en/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: hreflangLanguageAlternates(
          `${SITE_URL}/es/privacy-policy`,
          `${SITE_URL}/en/privacy-policy`,
        ),
      },
    },
  ];

  // Agregar landing pages de ciudad + servicio
  const langs = ['es', 'en'];
  // Ciudades e industrias salen de la config compartida para que sitemap, enlaces
  // internos y generateStaticParams no se desincronicen.
  langs.forEach((lang) => {
    LANDING_CITIES.forEach((city) => {
      LANDING_INDUSTRIES.forEach((industry) => {
        const translated = hasEnglishLanding(city, industry);
        // Sin traduccion, la version /en es la misma pagina en español y canonicaliza
        // a /es: incluirla solo gastaria rastreo en un duplicado.
        if (lang === 'en' && !translated) return;

        routes.push({
          url: `${SITE_URL}/${lang}/${city}/${industry}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
          ...(translated
            ? {
                alternates: {
                  languages: hreflangLanguageAlternates(
                    `${SITE_URL}/es/${city}/${industry}`,
                    `${SITE_URL}/en/${city}/${industry}`,
                  ),
                },
              }
            : {}),
        });
      });
    });
  });

  try {
    // Obtener servicios publicados
    const { data: services } = await supabase
      .from('services')
      .select('slug, updated_at')
      .not('slug', 'is', null);

    if (services) {
      services.forEach((service) => {
        routes.push({
          url: `${SITE_URL}/es/services/${service.slug}`,
          lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: hreflangLanguageAlternates(
              `${SITE_URL}/es/services/${service.slug}`,
              `${SITE_URL}/en/services/${service.slug}`,
            ),
          },
        });
        routes.push({
          url: `${SITE_URL}/en/services/${service.slug}`,
          lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: hreflangLanguageAlternates(
              `${SITE_URL}/es/services/${service.slug}`,
              `${SITE_URL}/en/services/${service.slug}`,
            ),
          },
        });
      });
    }

    // Fichas de portafolio (existen en /portfolio/[slug] y faltaban en el sitemap)
    const { data: portfolioItems } = await supabase
      .from('portfolio')
      .select('slug, updated_at')
      .not('slug', 'is', null);

    if (portfolioItems) {
      portfolioItems.forEach((item) => {
        langs.forEach((lang) => {
          routes.push({
            url: `${SITE_URL}/${lang}/portfolio/${item.slug}`,
            lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
            alternates: {
              languages: hreflangLanguageAlternates(
                `${SITE_URL}/es/portfolio/${item.slug}`,
                `${SITE_URL}/en/portfolio/${item.slug}`,
              ),
            },
          });
        });
      });
    }

    // Obtener posts del blog publicados
    const { data: blogPosts } = await supabase
      .from('blog')
      .select('slug, updated_at, created_at')
      .eq('published', true)
      .not('slug', 'is', null);

    if (blogPosts) {
      blogPosts.forEach((post) => {
        const lastModified = post.updated_at || post.created_at;
        routes.push({
          url: `${SITE_URL}/es/blog/${post.slug}`,
          lastModified: lastModified ? new Date(lastModified) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: hreflangLanguageAlternates(
              `${SITE_URL}/es/blog/${post.slug}`,
              `${SITE_URL}/en/blog/${post.slug}`,
            ),
          },
        });
        routes.push({
          url: `${SITE_URL}/en/blog/${post.slug}`,
          lastModified: lastModified ? new Date(lastModified) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: hreflangLanguageAlternates(
              `${SITE_URL}/es/blog/${post.slug}`,
              `${SITE_URL}/en/blog/${post.slug}`,
            ),
          },
        });
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
