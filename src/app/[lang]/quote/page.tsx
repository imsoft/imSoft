import { getDictionary, hasLocale } from '../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublicQuotationForm } from '../cotizador/public-quotation-form'
import { Metadata } from 'next'
import { HeroHeader } from '@/components/blocks/hero-section'
import { FooterSection } from '@/components/blocks/footer-section'

export async function generateMetadata({ params }: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'
  if (!hasLocale(lang)) return { title: 'Quote | imSoft', description: '' }
  const dict = await getDictionary(lang)
  return {
    title: `${dict.quote?.metaTitle ?? 'Quote'} | imSoft`,
    description: dict.quote?.metaDescription ?? '',
    openGraph: {
      title: `${dict.quote?.metaTitle ?? 'Quote'} | imSoft`,
      description: dict.quote?.metaDescription ?? '',
      type: 'website',
      locale: lang === 'es' ? 'es_MX' : 'en_US',
      url: `${SITE_URL}/${lang}/quote`,
    },
    alternates: {
      canonical: `${SITE_URL}/${lang}/quote`,
      languages: {
        'es': `${SITE_URL}/es/quote`,
        'en': `${SITE_URL}/en/quote`,
        'x-default': `${SITE_URL}/en/quote`,
      },
    },
  }
}

export default async function QuotePage({ params }: {
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
              {dict.quote?.title ?? 'Request a Quote'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict.quote?.subtitle ?? ''}
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
            <p>{dict.quote?.disclaimer ?? ''}</p>
          </div>
        </div>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </>
  )
}
