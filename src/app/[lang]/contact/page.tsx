import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import ContactForm from './contact-form';
import { Building2, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPhoneNumber } from '@/lib/utils/format-phone';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  const url = `${SITE_URL}/${lang}/contact`;

  return generateSEOMetadata({
    title: lang === 'es'
      ? 'Contacto - Contáctanos para Soluciones Tecnológicas'
      : 'Contact - Contact Us for Technology Solutions',
    description: lang === 'es'
      ? 'Contáctanos para discutir tus necesidades tecnológicas. Ofrecemos consultoría, desarrollo de software y soluciones personalizadas.'
      : 'Contact us to discuss your technology needs. We offer consulting, software development and custom solutions.',
    url,
    type: 'website',
    tags: lang === 'es'
      ? ['contacto', 'solicitar cotización', 'consultoría']
      : ['contact', 'request quote', 'consulting'],
    alternateUrls: {
      es: `${SITE_URL}/es/contact`,
      en: `${SITE_URL}/en/contact`,
    },
  }, lang);
}

export default async function ContactPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();
  
  // Obtener datos de contacto
  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle();

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  
  // Structured data para ContactPage
  const contactStructuredData = contactData ? {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    mainEntity: {
      '@type': 'Organization',
      name: 'imSoft',
      email: contactData.email || '',
      telephone: contactData.phone || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: contactData.address || '',
      },
    },
  } : null;

  // Breadcrumb structured data
  const breadcrumbStructuredData = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: lang === 'es' ? 'Inicio' : 'Home', url: `${SITE_URL}/${lang}` },
        { name: lang === 'es' ? 'Contacto' : 'Contact', url: `${SITE_URL}/${lang}/contact` },
      ],
    },
  });

  return (
    <>
      {contactStructuredData && (
        <StructuredData data={contactStructuredData} id="contact-structured-data" />
      )}
      <StructuredData data={breadcrumbStructuredData} id="breadcrumb-structured-data" />
      <div>
        <HeroHeader dict={dict} lang={lang} />
        <main className="pt-24">
        <div className="relative isolate bg-background">
          <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
            {/* Columna izquierda - Información de contacto */}
            <div className="relative px-6 pt-24 pb-20 sm:pt-32 lg:static lg:px-8 lg:py-48">
              <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
                <h2 className="text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
                  {dict.contact.getInTouch}
                </h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {dict.contact.description}
                </p>
                <dl className="mt-10 space-y-4 text-base leading-7 text-muted-foreground">
                  {contactData?.address && (
                    <div className="flex gap-x-4">
                      <dt className="flex-none">
                        <span className="sr-only">{dict.contact.address.label}</span>
                        <Building2 aria-hidden="true" className="h-7 w-6 text-muted-foreground" />
                      </dt>
                      <dd className="whitespace-pre-line">
                        {contactData.address}
                      </dd>
                    </div>
                  )}
                  {contactData?.phone && (
                    <div className="flex gap-x-4">
                      <dt className="flex-none">
                        <span className="sr-only">{dict.contact.phone.label}</span>
                        <Phone aria-hidden="true" className="h-7 w-6 text-muted-foreground" />
                      </dt>
                      <dd>
                        <Link
                          href={`tel:${contactData.phone.replace(/\s/g, '')}`}
                          className="hover:text-foreground transition-colors"
                        >
                          {formatPhoneNumber(contactData.phone)}
                        </Link>
                      </dd>
                    </div>
                  )}
                  {contactData?.email && (
                    <div className="flex gap-x-4">
                      <dt className="flex-none">
                        <span className="sr-only">{dict.contact.email.label}</span>
                        <Mail aria-hidden="true" className="h-7 w-6 text-muted-foreground" />
                      </dt>
                      <dd>
                        <Link 
                          href={`mailto:${contactData.email}`}
                          className="hover:text-foreground transition-colors"
                        >
                          {contactData.email}
                        </Link>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            
            {/* Columna derecha - Formulario */}
            <div className="px-6 pt-20 pb-24 sm:pb-32 lg:px-8 lg:py-48">
              <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
                <ContactForm dict={dict} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
    </>
  );
}
