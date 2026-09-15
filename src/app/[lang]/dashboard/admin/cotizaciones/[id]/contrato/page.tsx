import { hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContractEditor } from './contract-editor'
import type { Contract, Quote } from '@/types/quotes'

export default async function ContractPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params
  if (!hasLocale(lang)) notFound()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)
  const [{ data: quote }, { data: contract }] = await Promise.all([
    supabase.from('quotes').select('*').eq('id', id).maybeSingle(),
    supabase.from('contracts').select('*').eq('quote_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])
  if (!quote || !contract) notFound()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold"><span className="font-mono">{contract.folio}</span> <span className="text-muted-foreground text-xl">· {quote.title}</span></h1>
        <p className="text-muted-foreground">{lang === 'en' ? 'Contract from quote' : 'Contrato de la cotización'} {quote.folio}</p>
      </div>
      <ContractEditor lang={lang} quote={quote as Quote} contract={contract as Contract} publicUrl={`${siteUrl}/${contract.lang}/contrato/${contract.token}`} />
    </div>
  )
}
