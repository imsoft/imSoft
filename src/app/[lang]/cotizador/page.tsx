import { getDictionary, hasLocale } from '../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublicQuotationForm } from './public-quotation-form'
import { Metadata } from 'next'
import { HeroHeader } from '@/components/blocks/hero-section'
import { FooterSection } from '@/components/blocks/footer-section'

export async function generateMetadata({ params }: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'

  const title = lang === 'es'
    ? 'Cotizador en Línea - Obtén tu Presupuesto'
    : 'Online Quote - Get Your Estimate'

  const description = lang === 'es'
    ? 'Obtén una cotización instantánea para tu proyecto de software. Responde unas preguntas simples y recibe un presupuesto detallado al instante.'
    : 'Get an instant quote for your software project. Answer a few simple questions and receive a detailed estimate instantly.'

  return {
    title: `${title} | imSoft`,
    description,
    openGraph: {
      title: `${title} | imSoft`,
      description,
      type: 'website',
      locale: lang === 'es' ? 'es_MX' : 'en_US',
      url: `${SITE_URL}/${lang}/cotizador`,
    },
    alternates: {
      canonical: `${SITE_URL}/${lang}/cotizador`,
      languages: {
        'es': `${SITE_URL}/es/cotizador`,
        'en': `${SITE_URL}/en/quote`,
        'x-default': `${SITE_URL}/es/cotizador`,
      },
    },
  }
}

export default async function PublicQuotationPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()

  // Obtener servicios públicamente
  const { data: services } = await supabase
    .from('services')
    .select('id, title_es, title_en, slug')
    .order('title_es')

  // Obtener datos de contacto para el footer
  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle()

  return (
    <>
      <HeroHeader dict={dict} lang={lang} />
      <main className="pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {lang === 'en' ? 'Get Your Quote' : 'Obtén tu Cotización'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {lang === 'en'
                ? 'Answer a few questions and get an instant quote for your project'
                : 'Responde algunas preguntas y obtén una cotización instantánea para tu proyecto'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <PublicQuotationForm
              services={services || []}
              dict={dict}
              lang={lang}
            />
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              {lang === 'en'
                ? 'This is an automated estimate. Final pricing may vary based on specific requirements.'
                : 'Esta es una estimación automatizada. El precio final puede variar según los requisitos específicos.'}
            </p>
          </div>
        </div>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </>
  )
}
