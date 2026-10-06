import type { PaymentMethod, PaymentStatus } from '@/types/database'

const METODOS: PaymentMethod[] = ['cash', 'transfer', 'card', 'check', 'other']
const ESTADOS: PaymentStatus[] = ['pending', 'completed', 'cancelled']

export interface PagoNuevo {
  amount: number
  currency: string
  payment_method: PaymentMethod
  payment_date: string
  status: PaymentStatus
  notes: string | null
}

/** Valida lo que manda el formulario de pagos del panel. Null si falta algo o no tiene sentido. */
export function pagoValido(b: unknown): PagoNuevo | null {
  if (!b || typeof b !== 'object') return null
  const o = b as Record<string, unknown>
  const amount = Number(o.amount)
  const payment_method = String(o.payment_method ?? '') as PaymentMethod
  const status = String(o.status ?? '') as PaymentStatus
  const payment_date = String(o.payment_date ?? '')
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (!METODOS.includes(payment_method) || !ESTADOS.includes(status)) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payment_date)) return null
  return {
    amount,
    currency: typeof o.currency === 'string' && o.currency ? o.currency : 'MXN',
    payment_method,
    payment_date,
    status,
    notes: typeof o.notes === 'string' && o.notes.trim() ? o.notes.trim() : null,
  }
}
