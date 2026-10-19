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
