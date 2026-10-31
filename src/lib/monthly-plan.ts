/**
 * Monthly plan (2026-10-31): the client pays a deposit and N monthly fees that include
 * hosting and support; the code is handed over once paid off. It's charged with Stripe
 * Checkout in subscription mode: the deposit as a one-off charge right away and the monthly
 * fee as a recurring price that starts after a grace period (the time to go live).
 * Pure logic; the I/O lives in /api/quotes/[id]/plan-link and in the Stripe webhook.
 */
import type { MonthlyPlan } from './quotes'

/** Days between the deposit and the first monthly fee: the typical time to put the system in production. */
export const FIRST_MONTHLY_FEE_DAYS = 30

export interface PlanLineItem {
  price_data: {
    currency: string
    product_data: { name: string; description?: string }
    unit_amount: number
    recurring?: { interval: 'month' }
  }
  quantity: 1
}

/** Checkout line items: deposit (one-off) and monthly fee (recurring). Amounts in cents. */
export function planLineItems(o: { title: string; currency: string; deposit: number; monthlyFee: number; months: number }): PlanLineItem[] {
  const currency = o.currency.toLowerCase()
  return [
    { price_data: { currency, product_data: { name: `${o.title} · Anticipo del plan` }, unit_amount: Math.round(o.deposit * 100) }, quantity: 1 },
    { price_data: { currency, product_data: { name: `${o.title} · Plan mensual`, description: `${o.months} mensualidades con hosting y soporte incluidos; el código se transfiere al cubrir la última.` }, unit_amount: Math.round(o.monthlyFee * 100), recurring: { interval: 'month' } }, quantity: 1 },
  ]
}

/** Metadata carried by the subscription so the webhook knows the project and how many monthly fees there are. */
export function planMetadata(o: { projectId: string; quoteId: string; plan: MonthlyPlan }): Record<string, string> {
  return { project_id: o.projectId, quote_id: o.quoteId, plan: '1', months: String(o.plan.months) }
}

/**
 * Number of monthly fees in the subscription metadata. `meses` is the key used by
 * subscriptions created before the English rename; they are still being billed.
 */
export function planMonths(metadata: Record<string, string | undefined> | null | undefined): number {
  return Number(metadata?.months ?? metadata?.meses) || 0
}

/**
 * Label each plan charge is stored with in project_payments.notes. It's visible, stored text
 * and monthlyFeesCharged parses it: the format must not change.
 */
export function planChargeLabel(o: { isDeposit: boolean; number: number; months: number; invoiceId: string }): string {
  return o.isDeposit ? `Plan mensual · Anticipo · Stripe Invoice ${o.invoiceId}` : `Plan mensual · Mensualidad ${o.number}/${o.months} · Stripe Invoice ${o.invoiceId}`
}

/** How many monthly fees were already charged, counting the notes of the project's payments. */
export function monthlyFeesCharged(notes: Array<string | null | undefined>): number {
  return notes.filter((n) => /Plan mensual · Mensualidad \d+\//.test(n ?? '')).length
}

/** Once the last monthly fee is charged, the subscription must end. */
export function planPaidOff(charged: number, months: number): boolean {
  return charged >= months
}

/** What a Stripe invoice says about its subscription, in any API version. */
export function subscriptionFromInvoice(invoice: unknown): { subscriptionId: string | null; metadata: Record<string, string>; billingReason: string | null } {
  const inv = invoice as { subscription?: string | { id: string } | null; subscription_details?: { metadata?: Record<string, string> | null } | null; parent?: { subscription_details?: { subscription?: string | { id: string } | null; metadata?: Record<string, string> | null } | null } | null; billing_reason?: string | null }
  const sub = inv.parent?.subscription_details?.subscription ?? inv.subscription ?? null
  const subscriptionId = typeof sub === 'string' ? sub : sub?.id ?? null
  const metadata = inv.parent?.subscription_details?.metadata ?? inv.subscription_details?.metadata ?? {}
  return { subscriptionId, metadata: metadata ?? {}, billingReason: inv.billing_reason ?? null }
}
