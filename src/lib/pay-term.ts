/**
 * Fixed-term charge on imsoft.io/pagar: the client can only pay with the plan agreed when
 * the link was generated. Pure logic; Stripe feeds it with `available_plans`.
 */
import type { Term } from './payment-link-token'

export interface StripePlan {
  count?: number | null
  interval?: string | null
  type?: string | null
}

/** The installments plan to confirm, or null when the term is a single payment. */
export function planForTerm(term: Term): { count: number; interval: 'month'; type: 'fixed_count' } | null {
  return term ? { count: term, interval: 'month', type: 'fixed_count' } : null
}

/** The card supports the agreed term (a single payment is always possible). */
export function cardSupportsTerm(plans: StripePlan[] | null | undefined, term: Term): boolean {
  if (!term) return true
  return (plans ?? []).some((p) => p.count === term && (p.interval ?? 'month') === 'month' && (p.type ?? 'fixed_count') === 'fixed_count')
}

/** Term text for the client. */
export function termLabel(term: Term, es = true): string {
  if (!term) return es ? 'Una sola exhibición' : 'Single payment'
  return es ? `${term} meses sin intereses` : `${term} interest-free months`
}

/** What the client sees once the payment is done (just paid, or when reopening the link). */
export function paidSummary(o: { justPaid: boolean; charge: number; label: string; quoteNumber: string; date: Date; currency?: string; term?: Term }, es = true): { title: string; text: string; detail: string } {
  const amount = new Intl.NumberFormat(es ? 'es-MX' : 'en-US', { style: 'currency', currency: o.currency || 'MXN' }).format(o.charge)
  const date = o.date.toLocaleDateString(es ? 'es-MX' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' })
  const term = o.term ? ` ${es ? 'a' : 'in'} ${o.term} ${es ? 'meses sin intereses' : 'interest-free months'}` : ''
  return {
    title: o.justPaid ? (es ? '¡Recibimos tu pago!' : 'Payment received!') : (es ? 'Este pago ya está hecho' : 'This payment is already done'),
    text: es
      ? `${o.label} de la cotización ${o.quoteNumber}: ${amount}${term}, pagado el ${date}.`
      : `${o.label} of quote ${o.quoteNumber}: ${amount}${term}, paid on ${date}.`,
    detail: o.justPaid
      ? (es ? 'Stripe te manda el comprobante por correo en unos minutos. No tienes que hacer nada más.' : 'Stripe emails you the receipt in a few minutes. Nothing else to do.')
      : (es ? 'Este enlace era para un solo pago y ya se usó. Si te toca otro pago, pídenos el enlace nuevo.' : 'This link was for a single payment and has been used. Ask us for a new link for the next payment.'),
  }
}

/** Query param the pay page gets back on return from Stripe or the card form. */
export const PAID_RETURN_QUERY = 'payment=ok'

/**
 * Whether the visitor just came back from paying. New URLs use `?payment=ok`; URLs built
 * before the English rename (2026-10-31) use `?pago=ok` and may still be in flight
 * (open Checkout sessions, browser history), so both count.
 */
export function isPaidReturn(query: { payment?: string | string[]; pago?: string | string[] }): boolean {
  return query.payment === 'ok' || query.pago === 'ok'
}
