import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../../dictionaries';
import { notFound } from 'next/navigation';
import Image from "next/image";
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Magnet from '@/components/ui/magnet';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('portfolio')
    .select('title_es,title_en,description_es,description_en,image_url')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single();

  if (!data) return generateSEOMetadata({}, lang);

  const title = lang === 'en' ? (data.title_en || data.title_es || '') : (data.title_es || data.title_en || '');
  const description = lang === 'en' ? (data.description_en || data.description_es || '') : (data.description_es || data.description_en || '');
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';

  return generateSEOMetadata({
    title,
    description,
    url: `${SITE_URL}/${lang}/portfolio/${slug}`,
    image: data.image_url || `${SITE_URL}/logos/logo-imsoft-blue.png`,
    type: 'website',
    tags: lang === 'es'
      ? ['portafolio', 'caso de éxito', 'proyecto', 'desarrollo de software']
      : ['portfolio', 'case study', 'project', 'software development'],
    alternateUrls: {
      es: `${SITE_URL}/es/portfolio/${slug}`,
      en: `${SITE_URL}/en/portfolio/${slug}`,
    },
  }, lang);
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();

  const [{ data: contactData }, { data: project }] = await Promise.all([
    supabase.from('contact').select('*').limit(1).maybeSingle(),
    supabase
      .from('portfolio')
      .select('*')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single(),
  ]);

  if (!project) notFound();

  const title = lang === 'en'
    ? (project.title_en || project.title_es || project.title || '')
    : (project.title_es || project.title_en || project.title || '');

  const description = lang === 'en'
    ? (project.description_en || project.description_es || project.description || '')
    : (project.description_es || project.description_en || project.description || '');

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';

  const whatsappUrl = `https://wa.me/523325365558?text=${encodeURIComponent(
    lang === 'es'
      ? `Hola imSoft, vi el proyecto *${title}* en su portafolio y me gustaría algo similar. ¿Podemos agendar una llamada?`
      : `Hi imSoft, I saw the *${title}* project in your portfolio and I'd like something similar. Can we schedule a call?`
  )}`;

  const breadcrumbStructuredData = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: lang === 'es' ? 'Inicio' : 'Home', url: `${SITE_URL}/${lang}` },
        { name: lang === 'es' ? 'Portafolio' : 'Portfolio', url: `${SITE_URL}/${lang}/portfolio` },
        { name: title, url: `${SITE_URL}/${lang}/portfolio/${slug}` },
      ],
    },
  });

  return (
    <>
      <StructuredData data={breadcrumbStructuredData} id="breadcrumb-structured-data" />
      <div>
        <HeroHeader dict={dict} lang={lang} />
        <main className="pt-24">

          {/* Hero del proyecto */}
          <section className="py-16 md:py-24 bg-background">
            <div className="mx-auto max-w-5xl px-6">

              {/* Back link */}
              <Link
                href={`/${lang}/portfolio`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
              >
                <ArrowLeft className="h-4 w-4" />
                {lang === 'es' ? 'Volver al portafolio' : 'Back to portfolio'}
              </Link>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.project_type && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                    {project.project_type}
                  </span>
                )}
                {project.client && (
                  <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs font-semibold">
                    {project.client}
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{title}</h1>

              {/* Imagen principal */}
              {project.image_url && (
                <div className="relative w-full h-[480px] rounded-2xl overflow-hidden mb-12">
                  <Image
                    src={project.image_url}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Descripción */}
              <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Magnet padding={50} disabled={false} magnetStrength={10}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {lang === 'es' ? 'Quiero algo así' : 'I want something like this'}
                  </a>
                </Magnet>

                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-8 py-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {lang === 'es' ? 'Ver proyecto en vivo' : 'View live project'}
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="bg-primary py-20 px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                {lang === 'es' ? '¿Tienes un proyecto en mente?' : 'Got a project in mind?'}
              </h2>
              <p className="text-primary-foreground/75 text-lg mb-10 leading-relaxed">
                {lang === 'es'
                  ? 'Cuéntanos tu idea. La primera llamada es gratuita y sin compromiso.'
                  : 'Tell us your idea. The first call is free and with no commitment.'}
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-background text-foreground font-semibold px-8 py-4 rounded-xl hover:bg-muted transition-colors text-base"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {lang === 'es' ? 'Hablar con un experto' : 'Talk to an expert'}
              </a>
            </div>
          </section>

        </main>
        <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
      </div>
    </>
  );
}
