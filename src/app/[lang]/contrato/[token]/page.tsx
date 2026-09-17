import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import { serviceClient } from '@/lib/quotes/server'
import { ContractDocument } from '@/components/documents/contract-document'
import { AcceptForm } from '@/components/documents/accept-form'
import { PrintButton } from '@/components/documents/print-button'
import { Confetti } from '@/components/documents/confetti'
import type { Contract } from '@/types/quotes'

export const dynamic = 'force-dynamic'
export async function generateMetadata({ params }: { params: Promise<{ lang: string; token: string }> }): Promise<Metadata> {
  const { lang, token } = await params
  const { data } = await serviceClient().from('contracts').select('folio, status, quotes(title, client_name, client_company)').eq('token', token).maybeSingle()
  const q = (data as { quotes?: { title?: string; client_name?: string; client_company?: string | null } } | null)?.quotes
  if (!data) return { title: 'Contrato · imSoft', robots: { index: false, follow: false } }
  const title = `Contrato ${data.folio} · ${q?.title ?? ''} · imSoft`.replace(' ·  ·', ' ·')
  const description = `Para ${String(q?.client_company || q?.client_name || 'el cliente').replace(/\.$/, '')}. ${data.status === 'signed' ? 'Firmado en línea.' : 'Revísalo y fírmalo en línea.'}`
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: 'article', siteName: 'imSoft', locale: lang === 'en' ? 'en_US' : 'es_MX' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ContratoPublico({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang, token } = await params
  if (!hasLocale(lang)) notFound()
  const { data } = await serviceClient().from('contracts').select('*, quotes(client_name, client_company)').eq('token', token).maybeSingle()
  if (!data) notFound()
  const c = data as Contract & { quotes: { client_name: string; client_company?: string | null } | null }
  // Solo se puede firmar cuando esta enviado; en borrador el cliente solo ve el documento, sin avisos.
  const puedeFirmar = c.status === 'sent'
  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="no-print flex justify-end"><PrintButton lang={lang} /></div>
        <Confetti />
        <ContractDocument contract={c} clientName={c.quotes?.client_name ?? ''} clientCompany={c.quotes?.client_company} />
        {puedeFirmar && <AcceptForm endpoint={`/api/public/contracts/${token}/accept`} tipo="contrato" lang={lang} />}
      </div>
    </main>
  )
}
