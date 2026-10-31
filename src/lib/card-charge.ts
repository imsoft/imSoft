/**
 * Card charge from a quote: amount + surcharge and what is left after the Stripe fee.
 * Pure logic; the link is created in /api/quotes/[id]/payment-link.
 */
import { VAT_RATE, INSTALLMENT_EXTRA, STRIPE_FIXED, STRIPE_PCT } from './fee-simulator.ts'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** What the client is charged: amount plus the percentage surcharge. */
export function withSurcharge(amount: number, surchargePct: number): number {
  return round2(amount * (1 + Math.max(0, surchargePct) / 100))
}

/** Stripe fee (3.6 % + $3, plus VAT on the fee) and, when it applies, the installments cost. */
export function stripeFee(charge: number, months: 0 | 3 | 6 | 12 = 0): number {
  const base = charge * STRIPE_PCT + STRIPE_FIXED
  const installments = months ? charge * (INSTALLMENT_EXTRA[String(months) as '3' | '6' | '12'] ?? 0) : 0
  return round2((base + installments) * (1 + VAT_RATE))
}

/** What reaches the account after Stripe. */
export function netAfterStripe(charge: number, months: 0 | 3 | 6 | 12 = 0): number {
  return round2(charge - stripeFee(charge, months))
}

/** Minimum surcharge (in %) so that, after Stripe, at least the original amount is left. */
export function surchargeToCoverStripe(amount: number, months: 0 | 3 | 6 | 12 = 0): number {
  if (!(amount > 0)) return 0
  const rate = (STRIPE_PCT + (months ? INSTALLMENT_EXTRA[String(months) as '3' | '6' | '12'] ?? 0 : 0)) * (1 + VAT_RATE)
  const charge = (amount + STRIPE_FIXED * (1 + VAT_RATE)) / (1 - rate)
  return Math.ceil(((charge / amount - 1) * 100) * 100) / 100
}

export function validateCharge(amount: number, surchargePct: number): string | null {
  if (!(amount > 0)) return 'Pon el monto a cobrar.'
  if (amount < 10) return 'El monto mínimo para un enlace de pago es de $10.'
  if (surchargePct < 0 || surchargePct > 30) return 'El recargo va de 0 a 30 %.'
  return null
}
