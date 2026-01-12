import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../../dictionaries';
import { notFound } from 'next/navigation';
import Image from "next/image";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import Magnet from "@/components/ui/magnet";
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
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
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!service) {
    return generateSEOMetadata({}, lang);
  }

  const title = lang === 'en'
    ? (service.title_en || service.title || '')
    : (service.title_es || service.title || '');

  const description = lang === 'en'
    ? (service.description_en || service.description || '')
    : (service.description_es || service.description || '');

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  const url = `${SITE_URL}/${lang}/${lang === 'es' ? 'servicios' : 'services'}/${slug}`;
  const image = service.image_url || `${SITE_URL}/logos/logo-imsoft-blue.png`;

  return generateSEOMetadata({
    title,
    description,
    url,
    image,
    type: 'website',
    tags: lang === 'es'
      ? ['servicio', 'tecnología', 'desarrollo de software', 'consultoría']
      : ['service', 'technology', 'software development', 'consulting'],
    alternateUrls: {
      es: `${SITE_URL}/es/servicios/${slug}`,
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

  // Crear cliente de Supabase con service role
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  // Obtener datos de contacto
  let contactData = undefined;
  try {
    const { data } = await supabase
      .from('contact')
      .select('*')
      .limit(1)
      .maybeSingle();
    contactData = data || undefined;
  } catch (error) {
    // Error fetching contact data - silently fail
  }

  // Obtener el servicio por slug
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !service) {
    notFound();
  }

  // Obtener el contenido según el idioma
  const title = lang === 'en'
    ? (service.title_en || service.title || '')
    : (service.title_es || service.title || '');

  const description = lang === 'en'
    ? (service.description_en || service.description || '')
    : (service.description_es || service.description || '');

  const benefits = lang === 'en'
    ? (service.benefits_en || service.benefits_es || [])
    : (service.benefits_es || service.benefits_en || []);

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  const serviceUrl = `${SITE_URL}/${lang}/servicios/${slug}`;
  const serviceImage = service.image_url || `${SITE_URL}/logos/logo-imsoft-blue.png`;

  // Structured data para Service
  const serviceStructuredData = generateStructuredData({
    type: 'Service',
    data: {
      name: title,
      description,
      serviceType: title,
      url: serviceUrl,
      image: serviceImage,
    },
  });

  // Breadcrumb structured data
  const breadcrumbStructuredData = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: lang === 'es' ? 'Inicio' : 'Home', url: `${SITE_URL}/${lang}` },
        { name: lang === 'es' ? 'Servicios' : 'Services', url: `${SITE_URL}/${lang}/servicios` },
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
        <article className="py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left column - Title and Image */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {title}
                </h1>

                {service.image_url && (
                  <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                    <Image
                      src={service.image_url}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
              </div>

              {/* Right column - Description and benefits */}
              <div>
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>

                {benefits && benefits.length > 0 && (
                  <Card className="bg-white dark:bg-gray-900">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">
                        {lang === 'en' ? 'Benefits' : 'Beneficios'}
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

                {/* CTA Button */}
                <div className="mt-8">
                  <Magnet padding={50} disabled={false} magnetStrength={10}>
                    <Link
                      href={`/${lang}/contact`}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    >
                      {lang === 'en' ? 'Request a Quote' : 'Solicitar Cotización'}
                    </Link>
                  </Magnet>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
    </>
  );
}
