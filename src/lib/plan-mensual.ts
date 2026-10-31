/**
 * Plan mensual (31-oct-2026): el cliente paga un anticipo y N mensualidades con hosting y
 * soporte; el codigo se transfiere al liquidar. Se cobra con Stripe Checkout en modo
 * suscripcion: el anticipo como cargo unico al momento y la mensualidad como precio
 * recurrente que arranca tras un periodo de gracia (lo que tarda en salir a produccion).
 * Logica pura; la E/S vive en /api/quotes/[id]/plan-link y en el webhook de Stripe.
 */
import type { PlanMensual } from './cotizaciones'

/** Dias entre el anticipo y la primera mensualidad: el tiempo tipico de poner el sistema en produccion. */
export const DIAS_PRIMERA_MENSUALIDAD = 30

export interface LineaPlan {
  price_data: {
    currency: string
    product_data: { name: string; description?: string }
    unit_amount: number
    recurring?: { interval: 'month' }
  }
  quantity: 1
}

/** Lineas del Checkout: anticipo (unico) y mensualidad (recurrente). Montos en centavos. */
export function lineasDelPlan(o: { titulo: string; currency: string; anticipo: number; mensualidad: number; meses: number }): LineaPlan[] {
  const currency = o.currency.toLowerCase()
  return [
    { price_data: { currency, product_data: { name: `${o.titulo} · Anticipo del plan` }, unit_amount: Math.round(o.anticipo * 100) }, quantity: 1 },
    { price_data: { currency, product_data: { name: `${o.titulo} · Plan mensual`, description: `${o.meses} mensualidades con hosting y soporte incluidos; el código se transfiere al cubrir la última.` }, unit_amount: Math.round(o.mensualidad * 100), recurring: { interval: 'month' } }, quantity: 1 },
  ]
}

/** Metadata que viaja en la suscripcion para que el webhook sepa de que proyecto y cuantas mensualidades son. */
export function metadataDelPlan(o: { projectId: string; quoteId: string; plan: PlanMensual }): Record<string, string> {
  return { project_id: o.projectId, quote_id: o.quoteId, plan: '1', meses: String(o.plan.meses) }
}

/** Etiqueta con que se registra cada cobro del plan en project_payments. */
export function etiquetaCobroPlan(o: { esAnticipo: boolean; numero: number; meses: number; invoiceId: string }): string {
  return o.esAnticipo ? `Plan mensual · Anticipo · Stripe Invoice ${o.invoiceId}` : `Plan mensual · Mensualidad ${o.numero}/${o.meses} · Stripe Invoice ${o.invoiceId}`
}

/** Cuantas mensualidades ya se cobraron, contando las notas de los pagos del proyecto. */
export function mensualidadesCobradas(notas: Array<string | null | undefined>): number {
  return notas.filter((n) => /Plan mensual · Mensualidad \d+\//.test(n ?? '')).length
}

/** Con la ultima mensualidad cobrada, la suscripcion debe terminar. */
export function planLiquidado(cobradas: number, meses: number): boolean {
  return cobradas >= meses
}

/** Lo que trae la factura de Stripe sobre su suscripcion, en cualquier version del API. */
export function datosDeSuscripcion(invoice: unknown): { subscriptionId: string | null; metadata: Record<string, string>; billingReason: string | null } {
  const inv = invoice as { subscription?: string | { id: string } | null; subscription_details?: { metadata?: Record<string, string> | null } | null; parent?: { subscription_details?: { subscription?: string | { id: string } | null; metadata?: Record<string, string> | null } | null } | null; billing_reason?: string | null }
  const sub = inv.parent?.subscription_details?.subscription ?? inv.subscription ?? null
  const subscriptionId = typeof sub === 'string' ? sub : sub?.id ?? null
  const metadata = inv.parent?.subscription_details?.metadata ?? inv.subscription_details?.metadata ?? {}
  return { subscriptionId, metadata: metadata ?? {}, billingReason: inv.billing_reason ?? null }
}
