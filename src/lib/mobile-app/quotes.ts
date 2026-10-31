import { estaVencida, opcionesDePago, totales, type QuoteLike, type QuoteStatus } from '@/lib/cotizaciones'

/** What the app shows of a quote. No items or tax data: the detail lives on the public page. */
export interface AppQuote {
  id: string
  number: string
  title: string
  status: 'sent' | 'accepted' | 'rejected' | 'expired'
  /** List price; once accepted, the total of the payment option the client chose. */
  total: number
  /** "Transferencia bancaria", "Tarjeta a 12 meses sin intereses"…; null until they choose. */
  paymentOption: string | null
  currency: string
  vatIncluded: boolean
  validUntil: string
  url: string
}

export type QuoteRow = Pick<QuoteLike, 'items' | 'apply_iva' | 'discount' | 'valid_until' | 'accepted_payment_option'> & Partial<Pick<QuoteLike, 'payment'>> & {
  id: string
  number: string
  title: string
  status: QuoteStatus
  currency?: string | null
  token: string
  lang?: string | null
}

/** Turns database rows into what the client sees. Drafts never go out. */
export function quotesForApp(rows: QuoteRow[], site: string, today = new Date()): AppQuote[] {
  return rows
    .filter((q) => q.status !== 'draft')
    .map((q) => {
      // Published apps only read `total`: once accepted, it carries the chosen option's total.
      const chosen = q.status === 'accepted' && q.accepted_payment_option && q.payment
        ? opcionesDePago({ ...q, payment: q.payment, currency: q.currency || 'MXN' }).find((o) => o.clave === q.accepted_payment_option)
        : undefined
      return {
        id: q.id,
        number: q.number,
        title: q.title,
        status: appStatus(q, today),
        total: chosen?.total ?? totales(q).total,
        paymentOption: chosen?.titulo ?? null,
        currency: q.currency || 'MXN',
        vatIncluded: q.apply_iva,
        validUntil: q.valid_until,
        url: `${site}/${q.lang || 'es'}/cotizacion/${q.token}`,
      }
    })
}

function appStatus(q: Pick<QuoteLike, 'valid_until' | 'status'>, today: Date): AppQuote['status'] {
  if (q.status === 'accepted') return 'accepted'
  if (q.status === 'rejected') return 'rejected'
  if (q.status === 'expired' || estaVencida(q, today)) return 'expired'
  return 'sent'
}
