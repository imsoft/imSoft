import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { serviceClient, SITE_URL } from '@/lib/quotes/server'
import { contratosDelCliente, cotizacionesDelCliente } from '@/lib/documentos-cliente'
import { Card } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, FileSignature, FileText } from 'lucide-react'

/** Cotizaciones y contratos del cliente. El documento completo, la aceptacion y la firma viven en la pagina publica. */
export default async function ClientDocumentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)
  const isEs = lang === 'es'

  const db = serviceClient()
  const [cotizaciones, contratos] = await Promise.all([
    cotizacionesDelCliente(db, user, SITE_URL).catch((e) => { console.error('[client/documents] cotizaciones', e); return [] }),
    contratosDelCliente(db, user, SITE_URL).catch((e) => { console.error('[client/documents] contratos', e); return [] }),
  ])

  const dinero = (monto: number, moneda: string) => new Intl.NumberFormat(isEs ? 'es-MX' : 'en-US', { style: 'currency', currency: moneda }).format(monto)
  const fecha = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString(isEs ? 'es-MX' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

  const estadoCotizacion: Record<string, { label: string; className: string }> = {
    enviada: { label: isEs ? 'Pendiente de tu respuesta' : 'Awaiting your response', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
    aceptada: { label: isEs ? 'Aceptada' : 'Accepted', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    rechazada: { label: isEs ? 'Rechazada' : 'Rejected', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
    vencida: { label: isEs ? 'Vencida' : 'Expired', className: 'bg-muted text-muted-foreground' },
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.client.nav.documents}</h1>
        <p className="text-muted-foreground mt-1">
          {isEs ? 'Tus cotizaciones y contratos con imSoft. Cada uno se abre, se acepta y se firma en línea.' : 'Your quotes and contracts with imSoft. Each one opens, is accepted and signed online.'}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold flex items-center gap-2"><FileSignature className="size-5" />{isEs ? 'Contratos' : 'Contracts'}</h2>
        {contratos.length === 0 ? (
          <Empty className="border rounded-xl py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon"><FileSignature /></EmptyMedia>
              <EmptyTitle>{isEs ? 'Sin contratos' : 'No contracts'}</EmptyTitle>
              <EmptyDescription>{isEs ? 'Cuando te mandemos un contrato para firmar, aquí lo verás.' : 'When we send you a contract to sign, it will show up here.'}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-3">
            {contratos.map((c) => (
              <a key={c.id} href={c.enlace} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="p-5 hover:bg-muted/40 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{c.titulo}</p>
                      <p className="text-sm text-muted-foreground"><span className="font-mono">{c.folio}</span> · {isEs ? 'de la cotización' : 'from quote'} <span className="font-mono">{c.cotizacion}</span></p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        {c.estado === 'firmado'
                          ? <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">{isEs ? 'Firmado' : 'Signed'}{c.fechaFirma ? ` · ${fecha(c.fechaFirma)}` : ''}</Badge>
                          : <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">{isEs ? 'Pendiente de tu firma' : 'Awaiting your signature'}</Badge>}
                        {c.firmadoPor && <span className="text-muted-foreground">{isEs ? 'por' : 'by'} {c.firmadoPor}</span>}
                      </div>
                    </div>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground mt-1" />
                  </div>
                </Card>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="size-5" />{isEs ? 'Cotizaciones' : 'Quotes'}</h2>
        {cotizaciones.length === 0 ? (
          <Empty className="border rounded-xl py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon"><FileText /></EmptyMedia>
              <EmptyTitle>{isEs ? 'Sin cotizaciones' : 'No quotes'}</EmptyTitle>
              <EmptyDescription>{isEs ? 'Cuando te mandemos una cotización, aquí la verás.' : 'When we send you a quote, it will show up here.'}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-3">
            {cotizaciones.map((q) => {
              const e = estadoCotizacion[q.estado] ?? estadoCotizacion.enviada
              return (
                <a key={q.id} href={q.enlace} target="_blank" rel="noopener noreferrer" className="block">
                  <Card className="p-5 hover:bg-muted/40 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{q.titulo}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-mono">{q.folio}</span> · {isEs ? 'vigente hasta el' : 'valid until'} {fecha(q.vigencia)}</p>
                        <div className="mt-2"><Badge variant="outline" className={e.className}>{e.label}</Badge></div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold tabular-nums">{dinero(q.total, q.moneda)}</p>
                        <p className="text-xs text-muted-foreground">{q.ivaIncluido ? (isEs ? 'IVA incluido' : 'VAT included') : (isEs ? 'Sin IVA' : 'No VAT')}</p>
                      </div>
                    </div>
                  </Card>
                </a>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
