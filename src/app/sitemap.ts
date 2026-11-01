import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hreflangLanguageAlternates } from '@/lib/seo';
import { LANDING_CITIES, LANDING_INDUSTRIES } from '@/config/landing-pages-index';
import { cityServicePages } from '@/config/city-services';
import { PRICE_GUIDE_SLUGS } from '@/config/price-guides';
import { hasEnglishLanding } from '@/config/landing-pages-i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

/**
 * The sitemap used to be prerendered at build time and stayed frozen until the next
 * deploy: articles published by the weekly cron didn't show up until someone
 * redeployed. It's regenerated every hour.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Try the admin client first to avoid RLS issues
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    // Fall back to the regular client if there's no SERVICE_ROLE_KEY
    supabase = await createClient();
  }
  
  // The legal pages (privacy-policy, cookie-policy, terms-and-conditions) do NOT go
  // here: their generateMetadata emits `noindex`. Listing them in the sitemap while
  // asking Google not to index them is a contradiction, and they are exactly the
  // 6 URLs Search Console reports as "Excluded by 'noindex' tag".
  const routes: MetadataRoute.Sitemap = [
    // Main pages
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
      // Zapopan landing: Spanish only. The content targets local searches
      // with no volume in English, so /en canonicalizes here and isn't listed.
      url: `${SITE_URL}/es/zapopan/paginas-web`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
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
  ];

  // City + service landings ("paginas web guadalajara"...): Spanish only.
  for (const { city, slug } of cityServicePages()) {
    routes.push({ url: `${SITE_URL}/es/${city}/${slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 });
  }

  // "cuanto cuesta" guides: price searches in Mexico, Spanish only.
  for (const slug of PRICE_GUIDE_SLUGS) {
    routes.push({ url: `${SITE_URL}/es/cuanto-cuesta/${slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 });
  }

  // Add city + industry landing pages
  const langs = ['es', 'en'];
  // Cities and industries come from the shared config so the sitemap, internal
  // links and generateStaticParams don't drift apart.
  langs.forEach((lang) => {
    LANDING_CITIES.forEach((city) => {
      LANDING_INDUSTRIES.forEach((industry) => {
        const translated = hasEnglishLanding(city, industry);
        // Without a translation, the /en version is the same Spanish page and canonicalizes
        // to /es: including it would only waste crawl budget on a duplicate.
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
    // Fetch published services
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

    // Portfolio entries. The table has no `updated_at`: requesting it made the query
    // fail silently and the entries were left out of the sitemap.
    const { data: portfolioItems } = await supabase
      .from('portfolio')
      .select('slug, created_at')
      .not('slug', 'is', null);

    if (portfolioItems) {
      portfolioItems.forEach((item) => {
        langs.forEach((lang) => {
          routes.push({
            url: `${SITE_URL}/${lang}/portfolio/${item.slug}`,
            lastModified: item.created_at ? new Date(item.created_at) : new Date(),
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

    // Published posts. Each language uses its own slug (`slug_es` for /es); if the
    // column doesn't exist in the DB yet, it falls back to `slug` for both.
    let blogPosts: Array<{
      slug: string | null;
      slug_es?: string | null;
      updated_at?: string | null;
      created_at?: string | null;
    }> | null = null;

    const withEs = await supabase
      .from('blog')
      .select('slug, slug_es, updated_at, created_at')
      .eq('published', true)
      .not('slug', 'is', null);

    if (withEs.error) {
      const legacy = await supabase
        .from('blog')
        .select('slug, updated_at, created_at')
        .eq('published', true)
        .not('slug', 'is', null);
      blogPosts = legacy.data;
    } else {
      blogPosts = withEs.data;
    }

    if (blogPosts) {
      blogPosts.forEach((post) => {
        const lastModified = post.updated_at || post.created_at;
        const esSlug = post.slug_es || post.slug;
        const enSlug = post.slug || post.slug_es;
        routes.push({
          url: `${SITE_URL}/es/blog/${esSlug}`,
          lastModified: lastModified ? new Date(lastModified) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: hreflangLanguageAlternates(
              `${SITE_URL}/es/blog/${esSlug}`,
              `${SITE_URL}/en/blog/${enSlug}`,
            ),
          },
        });
        routes.push({
          url: `${SITE_URL}/en/blog/${enSlug}`,
          lastModified: lastModified ? new Date(lastModified) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: hreflangLanguageAlternates(
              `${SITE_URL}/es/blog/${esSlug}`,
              `${SITE_URL}/en/blog/${enSlug}`,
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
