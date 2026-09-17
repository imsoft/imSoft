import { hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuoteForm } from '../../quote-form'
import type { Quote } from '@/types/quotes'

export default async function EditQuotePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params
  if (!hasLocale(lang)) notFound()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)
  const { data: quote } = await supabase.from('quotes').select('*').eq('id', id).maybeSingle()
  if (!quote) notFound()
  // Una cotizacion aceptada es evidencia: ya no se edita (se hace una nueva).
  if (quote.status === 'accepted') redirect(`/${lang}/dashboard/admin/cotizaciones/${id}`)
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{lang === 'en' ? 'Edit quote' : 'Editar cotización'} <span className="font-mono text-muted-foreground text-xl">{quote.folio}</span></h1>
      {quote.status === 'sent' && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {lang === 'en' ? 'This quote was already sent. The client will see your changes instantly on the same link.' : 'Esta cotización ya se envió. El cliente verá tus cambios al instante en el mismo enlace; si cambias precio o alcance, avísale.'}
        </p>
      )}
      <QuoteForm lang={lang} quote={quote as Quote} />
    </div>
  )
}
