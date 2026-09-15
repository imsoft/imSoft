import { hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuoteDocument } from '@/components/documents/quote-document'
import { QuoteActions } from './quote-actions'
import { EstadoBadge } from '../quotes-table'
import type { Contract, Quote } from '@/types/quotes'

export default async function QuoteDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params
  if (!hasLocale(lang)) notFound()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)
  const [{ data: quote }, { data: contract }] = await Promise.all([
    supabase.from('quotes').select('*').eq('id', id).maybeSingle(),
    supabase.from('contracts').select('*').eq('quote_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])
  if (!quote) notFound()
  const q = quote as Quote
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><span className="font-mono">{q.folio}</span> <EstadoBadge quote={q} lang={lang} /></h1>
          <p className="text-muted-foreground">{q.client_name}{q.client_company ? ` · ${q.client_company}` : ''} · {q.title}</p>
        </div>
      </div>
      <QuoteActions lang={lang} quote={q} contract={(contract as Contract | null) ?? null} publicUrl={`${siteUrl}/${q.lang}/cotizacion/${q.token}`} />
      <QuoteDocument quote={q} />
    </div>
  )
}
