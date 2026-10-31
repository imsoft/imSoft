import { describe, expect, it } from 'vitest'
import { cardSupportsTerm, isPaidReturn, paidSummary, planForTerm, termLabel } from './pay-term'

describe('fixed term of the payment link', () => {
  const plans = [{ count: 3, interval: 'month', type: 'fixed_count' }, { count: 6, interval: 'month', type: 'fixed_count' }]

  it('a single payment is always possible; installments only if the card has that plan', () => {
    expect(cardSupportsTerm(null, 0)).toBe(true)
    expect(cardSupportsTerm(plans, 6)).toBe(true)
    expect(cardSupportsTerm(plans, 12)).toBe(false)
    expect(cardSupportsTerm([], 3)).toBe(false)
  })

  it('builds the plan confirmed in Stripe', () => {
    expect(planForTerm(6)).toEqual({ count: 6, interval: 'month', type: 'fixed_count' })
    expect(planForTerm(0)).toBeNull()
  })

  it('describes the term', () => {
    expect(termLabel(0)).toBe('Una sola exhibición')
    expect(termLabel(12)).toBe('12 meses sin intereses')
    expect(termLabel(3, false)).toBe('3 interest-free months')
  })

  it('after paying it states amount, concept, term and date; reopening the link says it was used', () => {
    const base = { charge: 28614.47, label: 'Pago 3 de 4', quoteNumber: 'COT-2026-001', date: new Date('2026-10-15T23:01:00Z'), term: 6 as const }
    const r = paidSummary({ ...base, justPaid: true })
    expect(r.title).toBe('¡Recibimos tu pago!')
    expect(r.text).toBe('Pago 3 de 4 de la cotización COT-2026-001: $28,614.47 a 6 meses sin intereses, pagado el 15 de octubre de 2026.')
    expect(r.detail).toMatch(/comprobante por correo/)
    const v = paidSummary({ ...base, justPaid: false, term: 0 })
    expect(v.title).toBe('Este pago ya está hecho')
    expect(v.text).not.toMatch(/meses/)
    expect(v.detail).toMatch(/un solo pago/)
  })

  it('recognizes the return from paying with the new and the legacy query param', () => {
    expect(isPaidReturn({ payment: 'ok' })).toBe(true)
    expect(isPaidReturn({ pago: 'ok' })).toBe(true)
    expect(isPaidReturn({})).toBe(false)
    expect(isPaidReturn({ payment: 'cancelled' })).toBe(false)
  })
})
