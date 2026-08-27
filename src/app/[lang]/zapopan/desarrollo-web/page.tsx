import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HeroHeader } from '@/components/blocks/hero-section';
import { FooterSection } from '@/components/blocks/footer-section';
import { BreadcrumbNav } from '@/components/seo/breadcrumb-nav';
import { StructuredData } from '@/components/seo/structured-data';
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { generateStructuredData } from '@/lib/seo';
import { ZAPOPAN_WEB } from '@/config/zapopan-web';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';
const ES_URL = `${SITE_URL}/es/zapopan/desarrollo-web`;

/**
 * Landing de desarrollo web en Zapopan.
 *
 * Es una ruta estatica dentro de [lang], asi que gana a la dinamica [city]/[service]:
 * Next da precedencia al segmento literal. Por eso `zapopan` no necesita entrar en
 * `landingPagesData`, que es para las combinaciones ciudad + industria.
 *
 * Solo existe en español. El contenido apunta a busquedas locales ("desarrollo web
 * Zapopan") que en ingles no tienen volumen, asi que /en canonicaliza a /es y se queda
 * fuera del sitemap en ingles, igual que las landings sin traducir.
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
      // Sin version en ingles: /en apunta al español para no registrar un duplicado.
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
      serviceType: 'Desarrollo web',
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

      <main className="pt-24">
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <BreadcrumbNav
            className="mb-6"
            items={[
              { name: 'Inicio', href: `/${lang}` },
              { name: 'Servicios', href: `/${lang}/services` },
              { name: 'Desarrollo web en Zapopan' },
            ]}
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">{ZAPOPAN_WEB.h1}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">{ZAPOPAN_WEB.heroSubtitle}</p>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-3xl font-bold mb-10">{ZAPOPAN_WEB.audience.title}</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {ZAPOPAN_WEB.audience.items.map((item) => (
                <div key={item.title}>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-3xl font-bold mb-8">{ZAPOPAN_WEB.problems.title}</h2>
            <ul className="space-y-3">
              {ZAPOPAN_WEB.problems.items.map((item) => (
                <li key={item} className="flex gap-3 text-muted-foreground">
                  <span aria-hidden className="text-primary mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-3xl font-bold mb-10">{ZAPOPAN_WEB.solutions.title}</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {ZAPOPAN_WEB.solutions.items.map((item) => (
                <div key={item.title}>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-3xl font-bold mb-3">{ZAPOPAN_WEB.proof.title}</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">{ZAPOPAN_WEB.proof.description}</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {ZAPOPAN_WEB.proof.items.map((item) => (
                <div key={item.name} className="rounded-lg border bg-background p-5">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            <Link
              href={`/${lang}/portfolio`}
              className="inline-block mt-8 text-primary hover:underline"
            >
              Ver el portafolio completo
            </Link>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{ZAPOPAN_WEB.cta.title}</h2>
            <p className="text-muted-foreground mb-8">{ZAPOPAN_WEB.cta.description}</p>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
            >
              {ZAPOPAN_WEB.cta.buttonText}
            </Link>
            <p className="mt-10 text-sm text-muted-foreground">
              ¿Buscas lo mismo en otra parte de la ZMG?{' '}
              <Link href={`/${lang}/services/web-pages`} className="text-primary hover:underline">
                Desarrollo de páginas web en Guadalajara
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}
