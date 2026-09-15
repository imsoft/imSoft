'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { estaVencida, mxn, totales } from '@/lib/cotizaciones'
import type { Quote } from '@/types/quotes'

const ESTADOS: Record<string, { es: string; en: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { es: 'Borrador', en: 'Draft', variant: 'outline' },
  sent: { es: 'Enviada', en: 'Sent', variant: 'secondary' },
  accepted: { es: 'Aceptada', en: 'Accepted', variant: 'default' },
  rejected: { es: 'Rechazada', en: 'Rejected', variant: 'destructive' },
  expired: { es: 'Vencida', en: 'Expired', variant: 'destructive' },
}

export function estadoDe(q: Pick<Quote, 'status' | 'valid_until'>): keyof typeof ESTADOS {
  return q.status !== 'accepted' && q.status !== 'rejected' && estaVencida(q) ? 'expired' : q.status
}

export function EstadoBadge({ quote, lang }: { quote: Pick<Quote, 'status' | 'valid_until'>; lang: string }) {
  const e = ESTADOS[estadoDe(quote)]
  return <Badge variant={e.variant}>{lang === 'en' ? e.en : e.es}</Badge>
}

export function QuotesTable({ quotes, lang }: { quotes: Quote[]; lang: string }) {
  if (quotes.length === 0) {
    return <p className="text-muted-foreground">{lang === 'en' ? 'No quotes yet.' : 'Todavía no hay cotizaciones.'}</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="text-left p-3">Folio</th>
            <th className="text-left p-3">{lang === 'en' ? 'Client' : 'Cliente'}</th>
            <th className="text-left p-3">{lang === 'en' ? 'Project' : 'Proyecto'}</th>
            <th className="text-right p-3">Total</th>
            <th className="text-left p-3">{lang === 'en' ? 'Valid until' : 'Vigencia'}</th>
            <th className="text-left p-3">{lang === 'en' ? 'Status' : 'Estado'}</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => (
            <tr key={q.id} className="border-t hover:bg-muted/30">
              <td className="p-3 font-mono"><Link className="underline underline-offset-4" href={`/${lang}/dashboard/admin/cotizaciones/${q.id}`}>{q.folio}</Link></td>
              <td className="p-3">{q.client_name}{q.client_company ? <span className="text-muted-foreground"> · {q.client_company}</span> : null}</td>
              <td className="p-3">{q.title}</td>
              <td className="p-3 text-right font-mono tabular-nums">{mxn(totales(q).total, q.currency)}</td>
              <td className="p-3">{q.valid_until}</td>
              <td className="p-3"><EstadoBadge quote={q} lang={lang} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
