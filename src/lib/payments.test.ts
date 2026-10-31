import { describe, expect, it } from 'vitest'
import { parsePayment } from './payments'

describe('payment from the dashboard', () => {
  const base = { amount: '40000', currency: 'MXN', payment_method: 'transfer', payment_date: '2026-10-06', status: 'completed', notes: ' Anticipo ' }

  it('accepts the form as the dashboard sends it and trims the notes', () => {
    expect(parsePayment(base)).toEqual({ amount: 40000, currency: 'MXN', payment_method: 'transfer', payment_date: '2026-10-06', status: 'completed', notes: 'Anticipo' })
    expect(parsePayment({ ...base, notes: '  ', currency: '' })).toMatchObject({ notes: null, currency: 'MXN' })
  })

  it('rejects amounts, methods, statuses or dates that do not exist', () => {
    expect(parsePayment(null)).toBeNull()
    expect(parsePayment({ ...base, amount: '0' })).toBeNull()
    expect(parsePayment({ ...base, amount: 'abc' })).toBeNull()
    expect(parsePayment({ ...base, payment_method: 'bitcoin' })).toBeNull()
    expect(parsePayment({ ...base, status: 'refunded' })).toBeNull()
    expect(parsePayment({ ...base, payment_date: '06/10/2026' })).toBeNull()
  })
})
