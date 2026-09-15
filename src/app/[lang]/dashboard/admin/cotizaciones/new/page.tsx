import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuoteForm } from '../quote-form'

export default async function NewQuotePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  await getDictionary(lang)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{lang === 'en' ? 'New quote' : 'Nueva cotización'}</h1>
      <QuoteForm lang={lang} />
    </div>
  )
}
