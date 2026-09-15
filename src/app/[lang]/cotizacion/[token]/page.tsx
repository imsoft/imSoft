import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import { serviceClient } from '@/lib/quotes/server'
import { QuoteDocument } from '@/components/documents/quote-document'
import { AcceptForm } from '@/components/documents/accept-form'
import { PrintButton } from '@/components/documents/print-button'
import { motivoNoAceptable } from '@/lib/cotizaciones'
import type { Quote } from '@/types/quotes'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Cotización · imSoft', robots: { index: false, follow: false } }

export default async function CotizacionPublica({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang, token } = await params
  if (!hasLocale(lang)) notFound()
  const { data } = await serviceClient().from('quotes').select('*').eq('token', token).maybeSingle()
  if (!data) notFound()
  const q = data as Quote
  const motivo = motivoNoAceptable(q)
  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="no-print flex justify-end"><PrintButton lang={lang} /></div>
        <QuoteDocument quote={q} />
        {motivo ? (
          <p className="no-print mx-auto max-w-3xl rounded-xl border bg-white p-4 text-sm text-neutral-700">{motivo}</p>
        ) : (
          <AcceptForm endpoint={`/api/public/quotes/${token}/accept`} tipo="cotizacion" lang={lang} />
        )}
      </div>
    </main>
  )
}
