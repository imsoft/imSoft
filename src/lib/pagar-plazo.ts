/**
 * Cobro con plazo fijo en imsoft.io/pagar: el cliente solo puede pagar con el plan que
 * se acordo al generar el enlace. Logica pura; Stripe la alimenta con `available_plans`.
 */
import type { Plazo } from './enlace-pago'

export interface PlanStripe {
  count?: number | null
  interval?: string | null
  type?: string | null
}

/** El plan de meses sin intereses que hay que confirmar, o null si el plazo es una exhibicion. */
export function planParaPlazo(plazo: Plazo): { count: number; interval: 'month'; type: 'fixed_count' } | null {
  return plazo ? { count: plazo, interval: 'month', type: 'fixed_count' } : null
}

/** La tarjeta admite el plazo acordado (a una exhibicion siempre se puede). */
export function tarjetaAdmitePlazo(planes: PlanStripe[] | null | undefined, plazo: Plazo): boolean {
  if (!plazo) return true
  return (planes ?? []).some((p) => p.count === plazo && (p.interval ?? 'month') === 'month' && (p.type ?? 'fixed_count') === 'fixed_count')
}

/** Texto del plazo para el cliente. */
export function etiquetaPlazo(plazo: Plazo, es = true): string {
  if (!plazo) return es ? 'Una sola exhibición' : 'Single payment'
  return es ? `${plazo} meses sin intereses` : `${plazo} interest-free months`
}

/** Lo que ve el cliente cuando el pago ya esta hecho (recien pagado o al reabrir el enlace). */
export function resumenPagoHecho(o: { recien: boolean; cobro: number; etiqueta: string; folio: string; fecha: Date; currency?: string; plazo?: Plazo }, es = true): { titulo: string; texto: string; detalle: string } {
  const monto = new Intl.NumberFormat(es ? 'es-MX' : 'en-US', { style: 'currency', currency: o.currency || 'MXN' }).format(o.cobro)
  const fecha = o.fecha.toLocaleDateString(es ? 'es-MX' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' })
  const plazo = o.plazo ? ` ${es ? 'a' : 'in'} ${o.plazo} ${es ? 'meses sin intereses' : 'interest-free months'}` : ''
  return {
    titulo: o.recien ? (es ? '¡Recibimos tu pago!' : 'Payment received!') : (es ? 'Este pago ya está hecho' : 'This payment is already done'),
    texto: es
      ? `${o.etiqueta} de la cotización ${o.folio}: ${monto}${plazo}, pagado el ${fecha}.`
      : `${o.etiqueta} of quote ${o.folio}: ${monto}${plazo}, paid on ${fecha}.`,
    detalle: o.recien
      ? (es ? 'Stripe te manda el comprobante por correo en unos minutos. No tienes que hacer nada más.' : 'Stripe emails you the receipt in a few minutes. Nothing else to do.')
      : (es ? 'Este enlace era para un solo pago y ya se usó. Si te toca otro pago, pídenos el enlace nuevo.' : 'This link was for a single payment and has been used. Ask us for a new link for the next payment.'),
  }
}
