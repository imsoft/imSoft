import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { City, Industry } from '@/types/landing-pages';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';

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
        languages: {
          es: `${SITE_URL}/es`,
          en: `${SITE_URL}/en`,
        },
      },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          es: `${SITE_URL}/es`,
          en: `${SITE_URL}/en`,
        },
      },
    },
    {
      url: `${SITE_URL}/es/servicios`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/servicios`,
          en: `${SITE_URL}/en/services`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/servicios`,
          en: `${SITE_URL}/en/services`,
        },
      },
    },
    {
      url: `${SITE_URL}/es/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/portfolio`,
          en: `${SITE_URL}/en/portfolio`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/portfolio`,
          en: `${SITE_URL}/en/portfolio`,
        },
      },
    },
    {
      url: `${SITE_URL}/es/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/blog`,
          en: `${SITE_URL}/en/blog`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/blog`,
          en: `${SITE_URL}/en/blog`,
        },
      },
    },
    {
      url: `${SITE_URL}/es/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/contact`,
          en: `${SITE_URL}/en/contact`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/contact`,
          en: `${SITE_URL}/en/contact`,
        },
      },
    },
    {
      url: `${SITE_URL}/es/terminos-y-condiciones`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/terminos-y-condiciones`,
          en: `${SITE_URL}/en/terms-and-conditions`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/terminos-y-condiciones`,
          en: `${SITE_URL}/en/terms-and-conditions`,
        },
      },
    },
    {
      url: `${SITE_URL}/es/aviso-de-privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/aviso-de-privacidad`,
          en: `${SITE_URL}/en/privacy-policy`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          es: `${SITE_URL}/es/aviso-de-privacidad`,
          en: `${SITE_URL}/en/privacy-policy`,
        },
      },
    },
  ];

  // Agregar landing pages de ciudad + servicio
  const langs = ['es', 'en'];
  const cities: City[] = ['guadalajara', 'cdmx', 'monterrey'];
  const industries: Industry[] = [
    'software-para-inmobiliarias',
    'software-para-constructoras',
    'software-para-restaurantes',
    'software-para-clinicas',
    'software-para-logistica',
  ];

  langs.forEach((lang) => {
    cities.forEach((city) => {
      industries.forEach((industry) => {
        routes.push({
          url: `${SITE_URL}/${lang}/${city}/${industry}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
          alternates: {
            languages: {
              es: `${SITE_URL}/es/${city}/${industry}`,
              en: `${SITE_URL}/en/${city}/${industry}`,
            },
          },
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
          url: `${SITE_URL}/es/servicios/${service.slug}`,
          lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: {
              es: `${SITE_URL}/es/servicios/${service.slug}`,
              en: `${SITE_URL}/en/services/${service.slug}`,
            },
          },
        });
        routes.push({
          url: `${SITE_URL}/en/services/${service.slug}`,
          lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: {
              es: `${SITE_URL}/es/servicios/${service.slug}`,
              en: `${SITE_URL}/en/services/${service.slug}`,
            },
          },
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
            languages: {
              es: `${SITE_URL}/es/blog/${post.slug}`,
              en: `${SITE_URL}/en/blog/${post.slug}`,
            },
          },
        });
        routes.push({
          url: `${SITE_URL}/en/blog/${post.slug}`,
          lastModified: lastModified ? new Date(lastModified) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              es: `${SITE_URL}/es/blog/${post.slug}`,
              en: `${SITE_URL}/en/blog/${post.slug}`,
            },
          },
        });
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
