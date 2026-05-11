import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../../dictionaries';
import { notFound } from 'next/navigation';
import Image from "next/image";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Check, ChevronDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import Magnet from "@/components/ui/magnet";
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { resolveServiceContent } from '@/lib/service-fallbacks';
import { StructuredData } from '@/components/seo/structured-data';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );

  const { data: serviceRow } = await supabase.from('services').select('*').eq('slug', slug).single();
  const service = resolveServiceContent(slug, serviceRow);

  if (!service) return generateSEOMetadata({}, lang);

  const title = lang === 'en' ? (service.title_en || service.title || '') : (service.title_es || service.title || '');
  const description = lang === 'en' ? (service.description_en || service.description || '') : (service.description_es || service.description || '');
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';

  return generateSEOMetadata({
    title,
    description,
    url: `${SITE_URL}/${lang}/services/${slug}`,
    image: service.image_url || `${SITE_URL}/logos/logo-imsoft-blue.png`,
    type: 'website',
    tags: lang === 'es'
      ? ['servicio', 'tecnología', 'desarrollo de software', 'consultoría']
      : ['service', 'technology', 'software development', 'consulting'],
    alternateUrls: {
      es: `${SITE_URL}/es/services/${slug}`,
      en: `${SITE_URL}/en/services/${slug}`,
    },
  }, lang);
}

export default async function ServicePage({ params }: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );

  let contactData = undefined;
  try {
    const { data } = await supabase.from('contact').select('*').limit(1).maybeSingle();
    contactData = data || undefined;
  } catch {}

  const { data: serviceRow } = await supabase.from('services').select('*').eq('slug', slug).single();
  const service = resolveServiceContent(slug, serviceRow);
  if (!service) notFound();

  const title = lang === 'en' ? (service.title_en || service.title || '') : (service.title_es || service.title || '');
  const description = lang === 'en' ? (service.description_en || service.description || '') : (service.description_es || service.description || '');
  const benefits = lang === 'en' ? (service.benefits_en || service.benefits_es || []) : (service.benefits_es || service.benefits_en || []);

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  const serviceUrl = `${SITE_URL}/${lang}/services/${slug}`;
  const serviceImage = service.image_url || `${SITE_URL}/logos/logo-imsoft-blue.png`;

  const whatsappUrl = `https://wa.me/523325365558?text=${encodeURIComponent(
    lang === 'es'
      ? `Hola imSoft, me interesa conocer más sobre el servicio de *${title}*. ¿Podemos agendar una llamada?`
      : `Hi imSoft, I'm interested in learning more about your *${title}* service. Can we schedule a call?`
  )}`;

  const steps = dict.serviceDetail?.howItWorks?.steps ?? [];
  const faqItems = dict.serviceDetail?.faq?.items ?? [];

  const serviceStructuredData = generateStructuredData({
    type: 'Service',
    data: { name: title, description, serviceType: title, url: serviceUrl, image: serviceImage },
  });

  const breadcrumbStructuredData = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: dict.common?.home ?? 'Home', url: `${SITE_URL}/${lang}` },
        { name: dict.nav?.services ?? 'Services', url: `${SITE_URL}/${lang}/services` },
        { name: title, url: serviceUrl },
      ],
    },
  });

  return (
    <>
      <StructuredData data={serviceStructuredData} id="service-structured-data" />
      <StructuredData data={breadcrumbStructuredData} id="breadcrumb-structured-data" />
      <div>
        <HeroHeader dict={dict} lang={lang} />
        <main className="pt-24">

          {/* ── Hero: título + imagen │ descripción + beneficios + CTA ── */}
          <section className="py-16 md:py-24 bg-background">
            <div className="mx-auto max-w-7xl px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
                  {service.image_url && (
                    <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
                      <Image src={service.image_url} alt={title} fill className="object-cover" priority />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">{description}</p>

                  {benefits && benefits.length > 0 && (
                    <Card className="bg-white dark:bg-gray-900 mb-8">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">
                          {dict.serviceDetail?.benefits ?? 'Benefits'}
                        </h2>
                        <ul className="space-y-3">
                          {benefits.map((benefit: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Magnet padding={50} disabled={false} magnetStrength={10}>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    >
                      {dict.serviceDetail?.requestQuote ?? 'Request Information'}
                    </a>
                  </Magnet>
                </div>

              </div>
            </div>
          </section>

          {/* ── Cómo trabajamos ── */}
          {steps.length > 0 && (
            <section className="py-16 md:py-24 bg-muted/40">
              <div className="mx-auto max-w-7xl px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
                  {dict.serviceDetail?.howItWorks?.title ?? '¿Cómo trabajamos?'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                  {steps.map((step, i) => (
                    <div key={i}>
                      <div className="text-7xl font-black text-primary/10 leading-none mb-4 select-none">
                        {step.number}
                      </div>
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── FAQ ── */}
          {faqItems.length > 0 && (
            <section className="py-16 md:py-24 bg-background">
              <div className="mx-auto max-w-3xl px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    {dict.serviceDetail?.faq?.title ?? 'Preguntas frecuentes'}
                  </h2>
                  {dict.serviceDetail?.faq?.subtitle && (
                    <p className="text-muted-foreground">{dict.serviceDetail.faq.subtitle}</p>
                  )}
                </div>
                <div className="space-y-3">
                  {faqItems.map((item, i) => (
                    <details key={i} className="group border border-border rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer font-medium list-none hover:bg-muted/50 transition-colors">
                        <span>{item.question}</span>
                        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="px-6 pb-5 pt-2 text-muted-foreground text-sm leading-relaxed border-t border-border">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── CTA Banner final ── */}
          <section className="bg-slate-900 py-20 px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {dict.serviceDetail?.ctaBanner?.title ?? '¿Listo para dar el siguiente paso?'}
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                {dict.serviceDetail?.ctaBanner?.description ?? ''}
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base shadow-lg shadow-green-900/30"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {dict.serviceDetail?.ctaBanner?.button ?? 'Hablar con un experto'}
              </a>
            </div>
          </section>

        </main>
        <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
      </div>
    </>
  );
}
