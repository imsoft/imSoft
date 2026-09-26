import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/app/[lang]/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { generateStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import { HeroHeader } from '@/components/blocks/hero-section';
import { FooterSection } from '@/components/blocks/footer-section';
import { CityServiceLanding } from '@/components/landing/city-service-landing';
import { GUIA_PRECIO_SLUGS, PRECIO_DE_SERVICIO, guiaPrecio, type GuiaPrecioSlug } from '@/config/guias-precio';
import { cityServiceHref, cityServiceTitle } from '@/config/city-services';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';

/** Landing de ciudad que corresponde a cada guia: quien pregunta el precio suele ser de GDL. */
const LANDING_DE_GUIA: Record<GuiaPrecioSlug, 'empresas-de-software'> = {
  'software-a-la-medida': 'empresas-de-software',
};

// Solo en español: son busquedas de Mexico ("cuanto cuesta una pagina web en mexico").
export const dynamicParams = false;
export function generateStaticParams() {
  return GUIA_PRECIO_SLUGS.map((slug) => ({ lang: 'es', slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = guiaPrecio(slug);
  if (!g) return {};
  const url = `${SITE}/es/cuanto-cuesta/${slug}`;
  return {
    title: g.seoTitle,
    description: g.seoDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: g.seoTitle, description: g.seoDescription, url, siteName: 'imSoft', locale: 'es_MX', type: 'article' },
  };
}

export default async function GuiaPrecio({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const g = guiaPrecio(slug);
  if (lang !== 'es' || !g) notFound();
  const dict = await getDictionary('es');
  const supabase = await createClient();
  const { data: contactData } = await supabase.from('contact').select('*').limit(1).maybeSingle();
  const url = `${SITE}/es/cuanto-cuesta/${slug}`;

  const faqSchema = generateStructuredData({ type: 'FAQPage', data: { questions: g.faq.items } });
  const breadcrumbSchema = generateStructuredData({
    type: 'BreadcrumbList',
    data: { items: [{ name: 'Inicio', url: `${SITE}/es` }, { name: 'Servicios', url: `${SITE}/es/services` }, { name: g.h1, url }] },
  });

  const s = slug as GuiaPrecioSlug;
  const related = [
    { name: cityServiceTitle('guadalajara', LANDING_DE_GUIA[s]), href: cityServiceHref('es', 'guadalajara', LANDING_DE_GUIA[s]) },
    // Las otras preguntas de precio, que responde el blog.
    PRECIO_DE_SERVICIO['paginas-web'],
    PRECIO_DE_SERVICIO['desarrollo-de-apps'],
  ];

  return (
    <div>
      <StructuredData data={faqSchema} id="guia-precio-faq-schema" />
      <StructuredData data={breadcrumbSchema} id="guia-precio-breadcrumb-schema" />
      <HeroHeader dict={dict} lang="es" />
      <CityServiceLanding
        lang="es"
        content={g}
        breadcrumb={[{ name: 'Inicio', href: '/es' }, { name: 'Servicios', href: '/es/services' }, { name: g.h1 }]}
        related={related}
      />
      <FooterSection dict={dict} lang="es" contactData={contactData || undefined} />
    </div>
  );
}
