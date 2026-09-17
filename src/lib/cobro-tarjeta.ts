/**
 * Cobro con tarjeta desde una cotizacion: monto + recargo y lo que queda tras la
 * comision de Stripe. Logica pura; el enlace se crea en /api/quotes/[id]/payment-link.
 */
import { IVA, MSI_EXTRA, STRIPE_FIJA, STRIPE_PCT } from './simulador-cobros.ts'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** Lo que se le cobra al cliente: monto mas el recargo en porcentaje. */
export function montoConRecargo(monto: number, recargoPct: number): number {
  return round2(monto * (1 + Math.max(0, recargoPct) / 100))
}

/** Comision de Stripe (3.6 % + $3, mas IVA de la comision) y, si aplica, el costo de los MSI. */
export function comisionStripe(cobro: number, meses: 0 | 3 | 6 | 12 = 0): number {
  const base = cobro * STRIPE_PCT + STRIPE_FIJA
  const msi = meses ? cobro * (MSI_EXTRA[String(meses) as '3' | '6' | '12'] ?? 0) : 0
  return round2((base + msi) * (1 + IVA))
}

/** Lo que llega a la cuenta despues de Stripe. */
export function netoTrasStripe(cobro: number, meses: 0 | 3 | 6 | 12 = 0): number {
  return round2(cobro - comisionStripe(cobro, meses))
}

/** Recargo minimo (en %) para que, tras Stripe, quede al menos el monto original. */
export function recargoQueCubreStripe(monto: number, meses: 0 | 3 | 6 | 12 = 0): number {
  if (!(monto > 0)) return 0
  const tasa = (STRIPE_PCT + (meses ? MSI_EXTRA[String(meses) as '3' | '6' | '12'] ?? 0 : 0)) * (1 + IVA)
  const cobro = (monto + STRIPE_FIJA * (1 + IVA)) / (1 - tasa)
  return Math.ceil(((cobro / monto - 1) * 100) * 100) / 100
}

export function validarCobro(monto: number, recargoPct: number): string | null {
  if (!(monto > 0)) return 'Pon el monto a cobrar.'
  if (monto < 10) return 'El monto mínimo para un enlace de pago es de $10.'
  if (recargoPct < 0 || recargoPct > 30) return 'El recargo va de 0 a 30 %.'
  return null
}
