import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import { serviceClient } from '@/lib/quotes/server'
import { ContractDocument } from '@/components/documents/contract-document'
import { AcceptForm } from '@/components/documents/accept-form'
import { PrintButton } from '@/components/documents/print-button'
import { Confetti } from '@/components/documents/confetti'
import type { Contract } from '@/types/quotes'
import { contractHash } from '@/lib/contract-hash'

export const dynamic = 'force-dynamic'
export async function generateMetadata({ params }: { params: Promise<{ lang: string; token: string }> }): Promise<Metadata> {
  const { lang, token } = await params
  const { data } = await serviceClient().from('contracts').select('number, status, quotes(title, client_name, client_company)').eq('token', token).maybeSingle()
  const q = (data as { quotes?: { title?: string; client_name?: string; client_company?: string | null } } | null)?.quotes
  if (!data) return { title: 'Contrato · imSoft', robots: { index: false, follow: false } }
  const title = `Contrato ${data.number} · ${q?.title ?? ''} · imSoft`.replace(' ·  ·', ' ·')
  const description = `Para ${String(q?.client_company || q?.client_name || 'el cliente').replace(/\.$/, '')}. ${data.status === 'signed' ? 'Firmado en línea.' : 'Revísalo y fírmalo en línea.'}`
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: 'article', siteName: 'imSoft', locale: lang === 'en' ? 'en_US' : 'es_MX' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function PublicContractPage({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang, token } = await params
  if (!hasLocale(lang)) notFound()
  const { data } = await serviceClient().from('contracts').select('*, quotes(client_name, client_company)').eq('token', token).maybeSingle()
  if (!data) notFound()
  const c = data as Contract & { quotes: { client_name: string; client_company?: string | null } | null }
  // It can only be signed once sent; as a draft the client only sees the document, with no notices.
  const canSign = c.status === 'sent'
  const current = contractHash(c.body_html)
  const hashCheck = c.signed_hash ? { current, matches: current === c.signed_hash } : null
  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="no-print flex justify-end"><PrintButton lang={lang} /></div>
        <Confetti />
        <ContractDocument contract={c} clientName={c.quotes?.client_name ?? ''} clientCompany={c.quotes?.client_company} hashCheck={hashCheck} />
        {canSign && <AcceptForm endpoint={`/api/public/contracts/${token}/accept`} kind="contract" lang={lang} />}
      </div>
    </main>
  )
}
