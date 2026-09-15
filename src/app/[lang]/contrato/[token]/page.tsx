import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import { serviceClient } from '@/lib/quotes/server'
import { ContractDocument } from '@/components/documents/contract-document'
import { AcceptForm } from '@/components/documents/accept-form'
import { PrintButton } from '@/components/documents/print-button'
import type { Contract } from '@/types/quotes'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contrato · imSoft', robots: { index: false, follow: false } }

export default async function ContratoPublico({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang, token } = await params
  if (!hasLocale(lang)) notFound()
  const { data } = await serviceClient().from('contracts').select('*, quotes(client_name, client_company)').eq('token', token).maybeSingle()
  if (!data) notFound()
  const c = data as Contract & { quotes: { client_name: string; client_company?: string | null } | null }
  const motivo = c.status === 'signed' ? null : c.status === 'sent' ? null : (lang === 'en' ? 'This contract has not been sent yet.' : 'Este contrato todavía no se ha enviado.')
  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="no-print flex justify-end"><PrintButton lang={lang} /></div>
        <ContractDocument contract={c} clientName={c.quotes?.client_name ?? ''} clientCompany={c.quotes?.client_company} />
        {c.status === 'signed' ? null : motivo ? (
          <p className="no-print mx-auto max-w-3xl rounded-xl border bg-white p-4 text-sm text-neutral-700">{motivo}</p>
        ) : (
          <AcceptForm endpoint={`/api/public/contracts/${token}/accept`} tipo="contrato" lang={lang} />
        )}
      </div>
    </main>
  )
}
